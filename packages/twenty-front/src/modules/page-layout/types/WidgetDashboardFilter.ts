import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { type buildDashboardFilterForWidget } from 'twenty-shared/utils';

export type WidgetDashboardFilter = ReturnType<
  typeof buildDashboardFilterForWidget
> & {
  isInvalid: boolean;
  gqlOperationFilter: RecordGqlOperationFilter;
};
