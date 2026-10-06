import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { mapChartWidgetsInDraft } from '@/page-layout/dashboard-filters/utils/mapChartWidgetsInDraft';
import { setChartWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/setChartWidgetDashboardFilterBindings';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The first edit freezes the built-ins as real slots with the bindings they currently resolve to, so nothing disappears from the bar when the dashboard goes custom.
export const convertBuiltInDashboardFilterSlotsToPersistedInDraft = ({
  draft,
  builtInSlots,
  builtInBindingsByWidgetId,
}: {
  draft: DraftPageLayout;
  builtInSlots: DashboardFilterSlot[];
  builtInBindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): DraftPageLayout => {
  if (isDefined(draft.dashboardFilters)) {
    return draft;
  }

  return mapChartWidgetsInDraft(
    { ...draft, dashboardFilters: builtInSlots },
    (widget) =>
      setChartWidgetDashboardFilterBindings(
        widget,
        Object.fromEntries(
          builtInSlots.map((slot) => [
            slot.id,
            builtInBindingsByWidgetId[widget.id]?.[slot.id] ?? null,
          ]),
        ),
      ),
  );
};
