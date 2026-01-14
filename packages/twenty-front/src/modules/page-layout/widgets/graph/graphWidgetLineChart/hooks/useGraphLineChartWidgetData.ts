import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { LINE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/lineChartData';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
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

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(LINE_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration,
      },
    },
  });

  const series = useMemo((): LineChartSeries[] => {
    if (!queryData?.lineChartData?.series) {
      return [];
    }

    return queryData.lineChartData.series.map(
      (seriesItem: {
        id: string;
        label?: string;
        color?: string;
        data: Array<{ x: string; y: number | null }>;
      }) => ({
        id: seriesItem.id,
        label: seriesItem.label,
        color: seriesItem.color,
        data: seriesItem.data.map(
          (point: { x: string; y: number | null }): LineChartDataPoint => ({
            x: point.x,
            y: point.y,
          }),
        ),
      }),
    );
  }, [queryData?.lineChartData?.series]);

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.lineChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.lineChartData?.formattedToRawLookup]);

  const colorMode: GraphColorMode =
    queryData?.lineChartData?.colorMode ?? 'automaticPalette';

  return {
    series,
    xAxisLabel: queryData?.lineChartData?.xAxisLabel,
    yAxisLabel: queryData?.lineChartData?.yAxisLabel,
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: queryData?.lineChartData?.showLegend ?? true,
    hasTooManyGroups: queryData?.lineChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
