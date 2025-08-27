import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const viewFieldAggregateOperationState = createFamilyState<
  ExtendedAggregateOperations | null | undefined,
  { viewFieldId: string }
>({
  key: 'viewFieldAggregateOperationState',
  defaultValue: null,
});
