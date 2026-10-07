import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A slot added or bound after mount gets its default once; a slot already seen is never re-seeded, so clearing it stays cleared.
export const resolveDashboardFilterValuesForNewSlots = ({
  slots,
  seenSlotIds,
  values,
}: {
  slots: DashboardFilterSlot[];
  seenSlotIds: ReadonlySet<string>;
  values: DashboardFilterValues;
}): DashboardFilterValues => {
  const defaultValuesOfNewSlots = getDashboardFilterDefaultValues({
    slots: slots.filter(
      (slot) => !seenSlotIds.has(slot.id) && !isDefined(values[slot.id]),
    ),
  });

  if (Object.keys(defaultValuesOfNewSlots).length === 0) {
    return values;
  }

  return { ...values, ...defaultValuesOfNewSlots };
};
