import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { transformGroupByDataToPieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/transformGroupByDataToPieChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
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
};

// TODO: Remove this once backend returns total group count
const EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS = 1;

export const useGraphPieChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphPieChartWidgetDataProps): UseGraphPieChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const {
    data: groupByData,
    loading,
    error,
    aggregateOperation,
  } = useGraphWidgetGroupByQuery({
    objectMetadataItemId,
    configuration,
    limit:
      PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
  });

  const transformedData = useMemo(
    () =>
      transformGroupByDataToPieChartData({
        groupByData,
        objectMetadataItem,
        configuration,
        aggregateOperation,
      }),
    [groupByData, objectMetadataItem, configuration, aggregateOperation],
  );

  return {
    ...transformedData,
    objectMetadataItem,
    loading,
    error,
  };
};
