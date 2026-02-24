import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const viewFieldAggregateOperationState = createFamilyStateV2<
  ExtendedAggregateOperations | null | undefined,
  { viewFieldId: string }
>({
  key: 'viewFieldAggregateOperationState',
  defaultValue: null,
});
