import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FindDashboardFilterSlotForChartBucketArgs = {
  widget: Pick<PageLayoutWidget, 'id'>;
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  groupByFieldMetadataId: string | undefined;
  groupBySubFieldName: string | null | undefined;
};

// A bucket is a value of the field the chart is grouped by, so it can only feed a slot this widget binds to the
// same field and sub-field. A binding through a relation target field filters on the related record's field,
// which is not what the bucket holds, so it never matches.
export const findDashboardFilterSlotForChartBucket = ({
  widget,
  slots,
  bindingsByWidgetId,
  groupByFieldMetadataId,
  groupBySubFieldName,
}: FindDashboardFilterSlotForChartBucketArgs):
  | DashboardFilterSlot
  | undefined => {
  if (!isDefined(groupByFieldMetadataId)) {
    return undefined;
  }

  const widgetBindings = bindingsByWidgetId[widget.id];

  if (!isDefined(widgetBindings)) {
    return undefined;
  }

  return slots.find((slot) => {
    const binding = widgetBindings[slot.id];

    return (
      isDefined(binding) &&
      binding.fieldMetadataId === groupByFieldMetadataId &&
      (binding.subFieldName ?? null) === (groupBySubFieldName ?? null) &&
      !isDefined(binding.relationTargetFieldMetadataId)
    );
  });
};
