import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { createState } from 'twenty-ui';

type AggregateOperation = {
  operation: AGGREGATE_OPERATIONS | null;
  availableFieldIdsForOperation: string[];
};

export const aggregateDropdownState = createState<AggregateOperation>({
  key: 'aggregateDropdownState',
  defaultValue: {
    operation: null,
    availableFieldIdsForOperation: [],
  },
});
