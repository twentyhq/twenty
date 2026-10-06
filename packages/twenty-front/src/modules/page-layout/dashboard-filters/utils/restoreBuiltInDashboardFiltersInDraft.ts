import { mapChartWidgetsInDraft } from '@/page-layout/dashboard-filters/utils/mapChartWidgetsInDraft';
import { setChartWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/setChartWidgetDashboardFilterBindings';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';

// Bindings are dropped with the slots they point at, so a later save cannot fail on a stale field reference nobody can see.
export const restoreBuiltInDashboardFiltersInDraft = (
  draft: DraftPageLayout,
): DraftPageLayout =>
  mapChartWidgetsInDraft({ ...draft, dashboardFilters: null }, (widget) =>
    setChartWidgetDashboardFilterBindings(widget, undefined),
  );
