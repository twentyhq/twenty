import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups.constant';
import { WAFFLE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/constants/WaffleChartMaximumNumberOfSlices.constant';
import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { transformGroupByDataToWaffleChartData } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/utils/transformGroupByDataToWaffleChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { useMemo } from 'react';
import { type WaffleChartConfiguration } from '~/generated/graphql';

type UseGraphWaffleChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: WaffleChartConfiguration;
};

type UseGraphWaffleChartWidgetDataResult = {
  data: WaffleChartDataItem[];
  showLegend: boolean;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  objectMetadataItem: ObjectMetadataItem;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  showDataLabels: boolean;
};

export const useGraphWaffleChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphWaffleChartWidgetDataProps): UseGraphWaffleChartWidgetDataResult => {
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
      WAFFLE_CHART_MAXIMUM_NUMBER_OF_SLICES + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
  });

  const transformedData = useMemo(
    () =>
      transformGroupByDataToWaffleChartData({
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
    loading,
    error,
  };
};
