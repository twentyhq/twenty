import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { type buildDashboardFilterForWidget } from 'twenty-shared/utils';

export type WidgetDashboardFilter = ReturnType<
  typeof buildDashboardFilterForWidget
> & {
  replacedWidgetRecordFilterIds: string[];
  isInvalid: boolean;
  gqlOperationFilter: RecordGqlOperationFilter;
  indicators: WidgetDashboardFilterIndicator[];
};
