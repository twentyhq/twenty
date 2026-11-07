import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import {
  buildDashboardFilterForWidget,
  InvalidDashboardFilterError,
  isNonEmptyArray,
} from 'twenty-shared/utils';

const INVALID_WIDGET_DASHBOARD_FILTER: WidgetDashboardFilter = {
  boundDashboardFilterValues: [],
  recordFilters: [],
  isInvalid: true,
};

// A value that cannot be resolved must never render as an unfiltered widget
export const computeDashboardFilterForWidget = (
  args: Parameters<typeof buildDashboardFilterForWidget>[0],
): WidgetDashboardFilter => {
  try {
    const { boundDashboardFilterValues, recordFilters, unresolvedBindings } =
      buildDashboardFilterForWidget(args);

    return isNonEmptyArray(unresolvedBindings)
      ? INVALID_WIDGET_DASHBOARD_FILTER
      : { boundDashboardFilterValues, recordFilters, isInvalid: false };
  } catch (error) {
    if (!(error instanceof InvalidDashboardFilterError)) {
      throw error;
    }

    return INVALID_WIDGET_DASHBOARD_FILTER;
  }
};
