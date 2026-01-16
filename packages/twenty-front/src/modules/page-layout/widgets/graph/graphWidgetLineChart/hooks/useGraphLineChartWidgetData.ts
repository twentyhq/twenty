import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { LINE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/lineChartData';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractLineChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractLineChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type UseGraphLineChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: LineChartConfiguration;
};

type UseGraphLineChartWidgetDataResult = {
  series: LineChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  showLegend: boolean;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
  loading: boolean;
  error?: Error;
  objectMetadataItem: ReturnType<
    typeof useObjectMetadataItemById
  >['objectMetadataItem'];
};

export const useGraphLineChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphLineChartWidgetDataProps): UseGraphLineChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const apolloCoreClient = useApolloCoreClient();

  const dataConfiguration = useMemo(
    () => extractLineChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(LINE_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.lineChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.lineChartData?.formattedToRawLookup]);

  const secondaryAxisField = useMemo(() => {
    if (!isDefined(configuration.secondaryAxisGroupByFieldMetadataId)) {
      return null;
    }

    return objectMetadataItem?.fields?.find(
      (field) => field.id === configuration.secondaryAxisGroupByFieldMetadataId,
    );
  }, [
    objectMetadataItem?.fields,
    configuration.secondaryAxisGroupByFieldMetadataId,
  ]);

  const selectFieldOptions = useMemo((): FieldMetadataItemOption[] | null => {
    if (!isDefined(secondaryAxisField)) {
      return null;
    }

    const isSelectField =
      secondaryAxisField.type === FieldMetadataType.SELECT ||
      secondaryAxisField.type === FieldMetadataType.MULTI_SELECT;

    if (!isSelectField || !isDefined(secondaryAxisField.options)) {
      return null;
    }

    return secondaryAxisField.options;
  }, [secondaryAxisField]);

  const configurationColor = useMemo(() => {
    return parseGraphColor(configuration.color);
  }, [configuration.color]);

  const colorMode = useMemo((): GraphColorMode => {
    return determineGraphColorMode({
      configurationColor: configuration.color,
      selectFieldOptions,
    });
  }, [configuration.color, selectFieldOptions]);

  const series = useMemo((): LineChartSeries[] => {
    if (!queryData?.lineChartData?.series) {
      return [];
    }

    return queryData.lineChartData.series.map(
      (seriesItem: {
        id: string;
        label?: string;
        data: Array<{ x: string; y: number | null }>;
      }): LineChartSeries => {
        const rawValue = formattedToRawLookup.get(seriesItem.id);

        const itemColor = determineChartItemColor({
          configurationColor,
          selectOptions: selectFieldOptions,
          rawValue: typeof rawValue === 'string' ? rawValue : undefined,
        });

        return {
          id: seriesItem.id,
          label: seriesItem.label,
          color: itemColor,
          data: seriesItem.data.map(
            (point: { x: string; y: number | null }): LineChartDataPoint => ({
              x: point.x,
              y: point.y,
            }),
          ),
        };
      },
    );
  }, [
    queryData?.lineChartData?.series,
    configurationColor,
    selectFieldOptions,
    formattedToRawLookup,
  ]);

  return {
    series,
    xAxisLabel: queryData?.lineChartData?.xAxisLabel,
    yAxisLabel: queryData?.lineChartData?.yAxisLabel,
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: configuration.displayLegend ?? true,
    hasTooManyGroups: queryData?.lineChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
