import { type buildDashboardFilterForWidget } from 'twenty-shared/utils';

export type WidgetDashboardFilter = Pick<
  ReturnType<typeof buildDashboardFilterForWidget>,
  'boundDashboardFilterValues' | 'recordFilters'
> & {
  isInvalid: boolean;
};
