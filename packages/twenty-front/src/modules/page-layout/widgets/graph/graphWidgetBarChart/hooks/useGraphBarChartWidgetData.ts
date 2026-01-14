import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { BAR_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/barChartData';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { useQuery } from '@apollo/client';
import { type BarDatum } from '@nivo/bar';
import { useMemo } from 'react';
import {
  type BarChartConfiguration,
  type BarChartLayout,
} from '~/generated/graphql';

type UseGraphBarChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
};

type UseGraphBarChartWidgetDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  showLegend: boolean;
  layout?: BarChartLayout;
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

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(BAR_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration,
      },
    },
  });

  const chartData = useMemo((): BarDatum[] => {
    if (!queryData?.barChartData?.data) {
      return [];
    }

    return queryData.barChartData.data as BarDatum[];
  }, [queryData?.barChartData?.data]);

  const series = useMemo((): BarChartSeries[] => {
    if (!queryData?.barChartData?.series) {
      return [];
    }

    return queryData.barChartData.series.map(
      (seriesItem: { key: string; label?: string; color?: string }) => ({
        key: seriesItem.key,
        label: seriesItem.label,
        color: seriesItem.color,
      }),
    );
  }, [queryData?.barChartData?.series]);

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.barChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.barChartData?.formattedToRawLookup]);

  const colorMode: GraphColorMode =
    queryData?.barChartData?.colorMode ?? 'automaticPalette';

  return {
    data: chartData,
    indexBy: queryData?.barChartData?.indexBy ?? 'id',
    keys: queryData?.barChartData?.keys ?? [],
    series,
    xAxisLabel: queryData?.barChartData?.xAxisLabel,
    yAxisLabel: queryData?.barChartData?.yAxisLabel,
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: queryData?.barChartData?.showLegend ?? true,
    layout: queryData?.barChartData?.layout,
    hasTooManyGroups: queryData?.barChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
