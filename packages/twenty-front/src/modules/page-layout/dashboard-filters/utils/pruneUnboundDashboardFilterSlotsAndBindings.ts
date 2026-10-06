import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterSlotDefinition } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinition';
import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { isDefined } from 'twenty-shared/utils';

// A slot nobody binds has no chip, since the chip borrows the inputs of a bound field; its entries go with it so a value left for it never reaches a chart.
export const pruneUnboundDashboardFilterSlotsAndBindings = ({
  slots,
  candidateBindingsByWidgetId,
}: {
  slots: DashboardFilterSlotDefinition[];
  candidateBindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): DashboardFilterSlotDefinitionsAndBindings => {
  const slotDefinitions = slots.filter((slot) =>
    Object.values(candidateBindingsByWidgetId).some((bindingsBySlotId) =>
      isDefined(bindingsBySlotId[slot.id]),
    ),
  );

  const existingSlotIds = new Set(slotDefinitions.map((slot) => slot.id));

  const bindingsByWidgetId = Object.fromEntries(
    Object.entries(candidateBindingsByWidgetId).map(
      ([widgetId, bindingsBySlotId]) => [
        widgetId,
        Object.fromEntries(
          Object.entries(bindingsBySlotId).filter(([slotId]) =>
            existingSlotIds.has(slotId),
          ),
        ),
      ],
    ),
  );

  return { slotDefinitions, bindingsByWidgetId };
};
