import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { createState } from '@ui/utilities/state/utils/createState';

export type KanbanAggregateOperation = {
  operation?: AGGREGATE_OPERATIONS | null;
  fieldMetadataId?: string | null;
} | null;

export const recordIndexKanbanAggregateOperationState =
  createState<KanbanAggregateOperation>({
    key: 'recordIndexKanbanAggregateOperationState',
    defaultValue: null,
  });
