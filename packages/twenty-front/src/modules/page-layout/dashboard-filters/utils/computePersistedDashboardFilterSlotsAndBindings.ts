import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

// Same rule as the built-ins: a slot no chart binds yet is kept on the layout for the editor but has no chip, since the chip borrows the inputs of a bound field.
export const computePersistedDashboardFilterSlotsAndBindings = ({
  slots,
  widgets,
}: {
  slots: DashboardFilterSlot[];
  widgets: PageLayoutWidget[];
}): DashboardFilterSlotDefinitionsAndBindings => {
  const candidateBindingsByWidgetId = Object.fromEntries(
    widgets
      .filter((widget) => widget.type === WidgetType.GRAPH)
      .map((widget) => {
        const widgetBindingsBySlotId = getWidgetDashboardFilterBindings(widget);

        // A missing key reads as null: the chart does not apply the slot.
        return [
          widget.id,
          Object.fromEntries(
            slots.map((slot) => [
              slot.id,
              widgetBindingsBySlotId[slot.id] ?? null,
            ]),
          ),
        ];
      }),
  );

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
