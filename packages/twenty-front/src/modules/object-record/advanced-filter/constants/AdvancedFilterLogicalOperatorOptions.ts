import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';

export const ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS = [
  {
    value: RecordFilterGroupLogicalOperator.AND,
    label: 'And',
  },
  {
    value: RecordFilterGroupLogicalOperator.OR,
    label: 'Or',
  },
];
