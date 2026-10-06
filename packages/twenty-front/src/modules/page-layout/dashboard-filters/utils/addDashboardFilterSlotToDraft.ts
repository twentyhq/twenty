import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { mapChartWidgetsInDraft } from '@/page-layout/dashboard-filters/utils/mapChartWidgetsInDraft';
import { setChartWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/setChartWidgetDashboardFilterBindings';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

// Every chart gets an explicit entry, null included, so a chart the slot does not apply to reads as a decision rather than an omission.
export const addDashboardFilterSlotToDraft = ({
  draft,
  slot,
  bindingsByWidgetId,
}: {
  draft: DraftPageLayout;
  slot: DashboardFilterSlot;
  bindingsByWidgetId: Record<string, DashboardFilterBinding | null>;
}): DraftPageLayout =>
  mapChartWidgetsInDraft(
    {
      ...draft,
      dashboardFilters: [...(draft.dashboardFilters ?? []), slot],
    },
    (widget) =>
      setChartWidgetDashboardFilterBindings(widget, {
        ...getWidgetDashboardFilterBindings(widget),
        [slot.id]: bindingsByWidgetId[widget.id] ?? null,
      }),
  );
