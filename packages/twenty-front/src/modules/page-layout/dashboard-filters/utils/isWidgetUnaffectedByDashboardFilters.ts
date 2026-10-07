import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

// Record tables filter through their view, so they are the only non-chart widgets a viewer could expect the chips to reach.
const DASHBOARD_DATA_WIDGET_TYPES: WidgetType[] = [
  WidgetType.GRAPH,
  WidgetType.RECORD_TABLE,
];

export const isWidgetUnaffectedByDashboardFilters = ({
  widget,
  slots,
  values,
  bindings,
}: {
  widget: Pick<PageLayoutWidget, 'type'>;
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Record<string, DashboardFilterBinding | null> | undefined;
}): boolean => {
  if (!DASHBOARD_DATA_WIDGET_TYPES.includes(widget.type)) {
    return false;
  }

  // Same predicate as the merge, so the indicator tracks what actually filters.
  const valuedSlots = slots.filter((slot) => {
    const value = values[slot.id];

    return isDefined(value) && isRecordFilterValueValid(value);
  });

  if (valuedSlots.length === 0) {
    return false;
  }

  return !valuedSlots.some((slot) => isDefined(bindings?.[slot.id]));
};
