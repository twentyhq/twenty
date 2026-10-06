import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { pruneUnboundDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/pruneUnboundDashboardFilterSlotsAndBindings';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

// A slot no chart binds yet stays on the layout for the editor but gets no chip.
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

  return pruneUnboundDashboardFilterSlotsAndBindings({
    slots,
    candidateBindingsByWidgetId,
  });
};
