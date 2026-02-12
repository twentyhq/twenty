import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { LINE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/lineChartData';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeriesWithColor';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractLineChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractLineChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type LineChartConfiguration,
  type LineChartDataPoint,
  type LineChartSeries,
} from '~/generated-metadata/graphql';

type UseGraphLineChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: LineChartConfiguration;
};

type UseGraphLineChartWidgetDataResult = {
  series: LineChartSeries[];
  showDataLabels: boolean;
  showLegend: boolean;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
  xAxisLabel: string;
  yAxisLabel: string;
  loading: boolean;
  error?: Error;
  objectMetadataItem: ObjectMetadataItem;
};

export const useGraphLineChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphLineChartWidgetDataProps): UseGraphLineChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const dataConfiguration = extractLineChartDataConfiguration(configuration);

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(LINE_CHART_DATA, {
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const formattedToRawLookup = queryData?.lineChartData?.formattedToRawLookup
    ? new Map(Object.entries(queryData.lineChartData.formattedToRawLookup))
    : new Map();

  const secondaryAxisField = objectMetadataItem?.fields?.find(
    (field) => field.id === configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const selectFieldOptions =
    isDefined(secondaryAxisField) &&
    (secondaryAxisField.type === FieldMetadataType.SELECT ||
      secondaryAxisField.type === FieldMetadataType.MULTI_SELECT)
      ? secondaryAxisField.options
      : null;

  const configurationColor = parseGraphColor(configuration.color);

  const colorMode = determineGraphColorMode({
    configurationColor,
    selectFieldOptions,
  });

  const series = queryData?.lineChartData?.series?.map(
    (seriesItem: {
      id: string;
      label: string;
      data: Array<LineChartDataPoint>;
    }): LineChartSeriesWithColor => {
      const rawValue = formattedToRawLookup.get(seriesItem.id);

      const itemColor = determineChartItemColor({
        configurationColor,
        selectOptions: selectFieldOptions,
        rawValue: isString(rawValue) ? rawValue : undefined,
      });

      return {
        id: seriesItem.id,
        label: seriesItem.label,
        color: itemColor,
        data: seriesItem.data.map(
          (point: LineChartDataPoint): LineChartDataPoint => ({
            x: point.x,
            y: point.y,
          }),
        ),
      };
    },
  );

  return {
    series,
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: configuration.displayLegend ?? true,
    hasTooManyGroups: queryData?.lineChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    xAxisLabel: queryData?.lineChartData?.xAxisLabel ?? '',
    yAxisLabel: queryData?.lineChartData?.yAxisLabel ?? '',
    loading,
    error,
  };
};
