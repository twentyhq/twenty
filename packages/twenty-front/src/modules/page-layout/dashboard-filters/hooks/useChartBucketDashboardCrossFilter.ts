import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { type ChartBucketCrossFilterTarget } from '@/page-layout/dashboard-filters/types/ChartBucketCrossFilterTarget';
import { buildDashboardFilterValueFromChartBucket } from '@/page-layout/dashboard-filters/utils/buildDashboardFilterValueFromChartBucket';
import { findDashboardFilterSlotForChartBucket } from '@/page-layout/dashboard-filters/utils/findDashboardFilterSlotForChartBucket';
import { isChartBucketFieldCrossFilterable } from '@/page-layout/dashboard-filters/utils/isChartBucketFieldCrossFilterable';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { normalizeChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

type UseChartBucketDashboardCrossFilterArgs = {
  widgetId: string;
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
  objectMetadataItem: { fields: FieldMetadataItem[] };
};

export const useChartBucketDashboardCrossFilter = ({
  widgetId,
  configuration,
  objectMetadataItem,
}: UseChartBucketDashboardCrossFilterArgs) => {
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const { groupByFieldMetadataId, groupBySubFieldName, dateGranularity } =
    normalizeChartConfigurationFields(configuration);

  const matchingSlot = findDashboardFilterSlotForChartBucket({
    widget: { id: widgetId },
    slots,
    bindingsByWidgetId,
    groupByFieldMetadataId,
    groupBySubFieldName,
  });

  const groupByFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === groupByFieldMetadataId,
  );

  const crossFilterSource =
    isDefined(matchingSlot) &&
    isDefined(groupByFieldMetadataItem) &&
    isChartBucketFieldCrossFilterable({
      fieldMetadataItem: groupByFieldMetadataItem,
      subFieldName: groupBySubFieldName,
    })
      ? { slot: matchingSlot, fieldMetadataItem: groupByFieldMetadataItem }
      : undefined;

  // Relation charts have no drilldown today; a matching slot is what makes their buckets clickable.
  const canCrossFilterChartBuckets = isDefined(crossFilterSource);

  const getChartBucketCrossFilterTarget = (
    bucketRawValue: RawDimensionValue,
  ): ChartBucketCrossFilterTarget | undefined => {
    // The empty bucket has no IS value, and a relation chart has no drilldown either, so its click does nothing.
    if (!isDefined(crossFilterSource) || !isDefined(bucketRawValue)) {
      return undefined;
    }

    const value = buildDashboardFilterValueFromChartBucket({
      fieldMetadataItem: crossFilterSource.fieldMetadataItem,
      bucketRawValue,
      dateGranularity,
      subFieldName: groupBySubFieldName,
    });

    return isDefined(value)
      ? { slot: crossFilterSource.slot, value }
      : undefined;
  };

  return { canCrossFilterChartBuckets, getChartBucketCrossFilterTarget };
};
