import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The chip edits the slot through one concrete field: the first widget binding found for that slot.
export const getDashboardFilterRepresentativeBinding = ({
  slotId,
  bindingsByWidgetId,
}: {
  slotId: string;
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
}): DashboardFilterBinding | undefined =>
  Object.values(bindingsByWidgetId)
    .map((bindings) => bindings[slotId])
    .find(isDefined);
