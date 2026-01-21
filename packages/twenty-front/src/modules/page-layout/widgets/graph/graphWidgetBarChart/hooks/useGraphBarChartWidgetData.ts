import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { BAR_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/barChartData';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { getEffectiveGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { type BarDatum } from '@nivo/bar';
import { isString } from '@sniptt/guards';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type BarChartLayout,
  type BarChartSeries,
} from '~/generated/graphql';

type UseGraphBarChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
};

type UseGraphBarChartWidgetDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeriesWithColor[];
  xAxisLabel: string;
  yAxisLabel: string;
  showDataLabels: boolean;
  showLegend: boolean;
  layout?: BarChartLayout;
  groupMode: 'grouped' | 'stacked' | undefined;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
  objectMetadataItem: ReturnType<
    typeof useObjectMetadataItemById
  >['objectMetadataItem'];
};

export const useGraphBarChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphBarChartWidgetDataProps): UseGraphBarChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const apolloCoreClient = useApolloCoreClient();

  const dataConfiguration = useMemo(
    () => extractBarChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(BAR_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const chartData = (queryData?.barChartData?.data as BarDatum[]) ?? [];

  const formattedToRawLookup = queryData?.barChartData?.formattedToRawLookup
    ? new Map(Object.entries(queryData.barChartData.formattedToRawLookup))
    : new Map();

  const colorDeterminingFieldId = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? configuration.secondaryAxisGroupByFieldMetadataId
    : configuration.primaryAxisGroupByFieldMetadataId;

  const colorDeterminingField = objectMetadataItem?.fields?.find(
    (field) => field.id === colorDeterminingFieldId,
  );

  const selectFieldOptions = useMemo((): FieldMetadataItemOption[] | null => {
    if (!isDefined(colorDeterminingField)) {
      return null;
    }

    const isSelectField =
      colorDeterminingField.type === FieldMetadataType.SELECT ||
      colorDeterminingField.type === FieldMetadataType.MULTI_SELECT;

    if (!isSelectField || !isDefined(colorDeterminingField.options)) {
      return null;
    }

    return colorDeterminingField.options;
  }, [colorDeterminingField]);

  const configurationColor = parseGraphColor(configuration.color);

  const colorMode = determineGraphColorMode({
    configurationColor,
    selectFieldOptions,
  });

  const series = queryData?.barChartData?.series?.map(
    (seriesItem: BarChartSeries): BarChartSeriesWithColor => {
      const rawValue = formattedToRawLookup.get(seriesItem.key);

      const itemColor = determineChartItemColor({
        configurationColor,
        selectOptions: selectFieldOptions,
        rawValue: isString(rawValue) ? rawValue : undefined,
      });

      return {
        key: seriesItem.key,
        label: seriesItem.label,
        color: itemColor,
      };
    },
  );

  return {
    data: chartData,
    indexBy: queryData?.barChartData?.indexBy ?? 'id',
    keys: queryData?.barChartData?.keys ?? [],
    series,
    xAxisLabel: queryData?.barChartData?.xAxisLabel ?? '',
    yAxisLabel: queryData?.barChartData?.yAxisLabel ?? '',
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: configuration.displayLegend ?? true,
    layout: queryData?.barChartData?.layout,
    groupMode: getEffectiveGroupMode(
      configuration.groupMode,
      configuration.secondaryAxisGroupByFieldMetadataId,
    ),
    hasTooManyGroups: queryData?.barChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
