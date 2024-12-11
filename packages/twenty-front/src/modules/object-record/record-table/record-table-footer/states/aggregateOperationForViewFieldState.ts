import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const aggregateOperationForViewFieldState = createFamilyState<
  AGGREGATE_OPERATIONS | null | undefined,
  { viewFieldId: string }
>({
  key: 'aggregateOperationForViewFieldState',
  defaultValue: null,
});
