import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const viewFieldAggregateOperationState = createAtomFamilyState<
  ExtendedAggregateOperations | null | undefined,
  { viewFieldId: string }
>({
  key: 'viewFieldAggregateOperationState',
  defaultValue: null,
});
