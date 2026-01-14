import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PIE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/pieChartData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { type PieChartConfiguration } from '~/generated/graphql';

type UseGraphPieChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
};

type UseGraphPieChartWidgetDataResult = {
  data: PieChartDataItem[];
  showLegend: boolean;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  objectMetadataItem: ObjectMetadataItem;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
  showDataLabels: boolean;
  showCenterMetric: boolean;
};

export const useGraphPieChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphPieChartWidgetDataProps): UseGraphPieChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const apolloCoreClient = useApolloCoreClient();

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(PIE_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration,
      },
    },
  });

  const chartData = useMemo((): PieChartDataItem[] => {
    if (!queryData?.pieChartData?.data) {
      return [];
    }

    return queryData.pieChartData.data.map(
      (item: { id: string; value: number; color?: string }) => ({
        id: item.id,
        value: item.value,
        color: item.color,
      }),
    );
  }, [queryData?.pieChartData?.data]);

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.pieChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.pieChartData?.formattedToRawLookup]);

  const colorMode: GraphColorMode =
    queryData?.pieChartData?.colorMode ?? 'automaticPalette';

  return {
    data: chartData,
    showLegend: queryData?.pieChartData?.showLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    showCenterMetric: configuration.showCenterMetric ?? true,
    hasTooManyGroups: queryData?.pieChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
