import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { mapChartWidgetsInDraft } from '@/page-layout/dashboard-filters/utils/mapChartWidgetsInDraft';
import { setChartWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/setChartWidgetDashboardFilterBindings';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

// Removing the last slot leaves an empty list, not null: the dashboard stays on custom filters until the built-ins are restored on purpose.
export const removeDashboardFilterSlotFromDraft = ({
  draft,
  slotId,
}: {
  draft: DraftPageLayout;
  slotId: string;
}): DraftPageLayout =>
  mapChartWidgetsInDraft(
    {
      ...draft,
      dashboardFilters: (draft.dashboardFilters ?? []).filter(
        (slot) => slot.id !== slotId,
      ),
    },
    (widget) =>
      setChartWidgetDashboardFilterBindings(
        widget,
        removePropertiesFromRecord(getWidgetDashboardFilterBindings(widget), [
          slotId,
        ]),
      ),
  );
