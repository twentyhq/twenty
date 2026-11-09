import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';

export const NO_WIDGET_DASHBOARD_FILTER: WidgetDashboardFilter = {
  recordFilters: [],
  appliedFields: [],
  notAppliedPageLayoutFilterIds: [],
  unresolvedPageLayoutFilterIds: [],
  replacedWidgetRecordFilterIds: [],
  isInvalid: false,
  gqlOperationFilter: {},
  indicators: [],
};
