import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { transformGroupByDataToPieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/transformGroupByDataToPieChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
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
  const { objectMetadataItems } = useObjectMetadataItems();

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
        objectMetadataItems: objectMetadataItems ?? [],
        configuration,
        aggregateOperation,
      }),
    [
      groupByData,
      objectMetadataItem,
      objectMetadataItems,
      configuration,
      aggregateOperation,
    ],
  );

  return {
    ...transformedData,
    objectMetadataItem,
    showDataLabels: configuration.displayDataLabel ?? false,
    showCenterMetric: configuration.showCenterMetric ?? true,
    loading,
    error,
  };
};
