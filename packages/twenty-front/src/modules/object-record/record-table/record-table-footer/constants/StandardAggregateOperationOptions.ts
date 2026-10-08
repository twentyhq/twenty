import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/CountAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/PercentAggregateOperationOptions';

export const STANDARD_AGGREGATE_OPERATION_OPTIONS = [
  ...COUNT_AGGREGATE_OPERATION_OPTIONS,
  ...PERCENT_AGGREGATE_OPERATION_OPTIONS,
];
