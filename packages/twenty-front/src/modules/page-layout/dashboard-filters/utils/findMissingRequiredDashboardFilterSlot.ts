import { isDashboardFilterValueSet } from '@/page-layout/dashboard-filters/utils/isDashboardFilterValueSet';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

// A required slot only blocks the charts it is bound to; an unbound chart has nothing to wait for.
export const findMissingRequiredDashboardFilterSlot = ({
  widget,
  slots,
  values,
  bindings,
}: {
  widget: Pick<PageLayoutWidget, 'type'>;
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
  bindings: Record<string, DashboardFilterBinding | null> | undefined;
}): DashboardFilterSlot | null => {
  if (widget.type !== WidgetType.GRAPH) {
    return null;
  }

  return (
    slots.find(
      (slot) =>
        slot.isRequired === true &&
        isDefined(bindings?.[slot.id]) &&
        !isDashboardFilterValueSet(values[slot.id]),
    ) ?? null
  );
};
