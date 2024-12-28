import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const viewFieldAggregateOperationState = createFamilyState<
  AGGREGATE_OPERATIONS | null | undefined,
  { viewFieldId: string }
>({
  key: 'viewFieldAggregateOperationState',
  defaultValue: null,
});
