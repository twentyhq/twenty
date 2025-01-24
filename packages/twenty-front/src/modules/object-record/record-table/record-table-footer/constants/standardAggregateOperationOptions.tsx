import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';

export const STANDARD_AGGREGATE_OPERATION_OPTIONS = [
  ...COUNT_AGGREGATE_OPERATION_OPTIONS,
  ...PERCENT_AGGREGATE_OPERATION_OPTIONS,
];
