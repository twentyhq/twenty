import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

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
  // Only charts can be bound; record tables filter through their view and are out of scope.
  if (widget.type !== WidgetType.GRAPH) {
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
