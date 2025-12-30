import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { transformGroupByDataToPieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/transformGroupByDataToPieChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
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

  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const transformedData = useMemo(
    () =>
      transformGroupByDataToPieChartData({
        groupByData,
        objectMetadataItem,
        configuration,
        aggregateOperation,
        userTimezone,
        firstDayOfTheWeek: userFirstDayOfTheWeek,
      }),
    [
      groupByData,
      objectMetadataItem,
      configuration,
      aggregateOperation,
      userTimezone,
      userFirstDayOfTheWeek,
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
