import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { combineFilters } from 'twenty-shared/utils';

export const getRecordTableColumnFooterAggregateFilter = ({
  viewFilter,
  recordGroupFilter,
  anyFieldFilter,
  additionalFilter,
}: {
  viewFilter: RecordGqlOperationFilter;
  recordGroupFilter: RecordGqlOperationFilter;
  anyFieldFilter: RecordGqlOperationFilter;
  additionalFilter: RecordGqlOperationFilter;
}): RecordGqlOperationFilter =>
  combineFilters([
    viewFilter,
    recordGroupFilter,
    anyFieldFilter,
    additionalFilter,
  ]);
