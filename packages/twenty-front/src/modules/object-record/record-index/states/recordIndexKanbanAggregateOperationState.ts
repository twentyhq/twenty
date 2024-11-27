import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { createState } from 'twenty-ui';

type KanbanAggregateOperation = {
  operation: AGGREGATE_OPERATIONS;
  fieldMetadataId?: string;
} | null;

export const recordIndexKanbanAggregateOperationState =
  createState<KanbanAggregateOperation | null>({
    key: 'recordIndexKanbanAggregateOperationState',
    defaultValue: null,
  });
