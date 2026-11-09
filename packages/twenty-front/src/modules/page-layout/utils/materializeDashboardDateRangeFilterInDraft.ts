import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/page-layout/constants/DashboardDateRangeFilterId';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { getDashboardPageLayoutFilters } from '@/page-layout/utils/getDashboardPageLayoutFilters';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { isNonEmptyArray } from 'twenty-shared/utils';

// The server rejects a binding to a filter missing from the layout's filters
export const materializeDashboardDateRangeFilterInDraft = (
  pageLayoutDraft: DraftPageLayout,
): DraftPageLayout => {
  const isDateRangeFilterBound = pageLayoutDraft.tabs.some((tab) =>
    tab.widgets.some((widget) =>
      getWidgetDashboardFilterBindings(widget.configuration).some(
        ({ pageLayoutFilterId }) =>
          pageLayoutFilterId === DASHBOARD_DATE_RANGE_FILTER_ID,
      ),
    ),
  );

  if (!isDateRangeFilterBound || isNonEmptyArray(pageLayoutDraft.filters)) {
    return pageLayoutDraft;
  }

  return {
    ...pageLayoutDraft,
    filters: getDashboardPageLayoutFilters(pageLayoutDraft.filters),
  };
};
