import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const syncedRecordOperationKeysComponentState = createAtomComponentState<
  Set<string>
>({
  key: 'syncedRecordOperationKeysComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: new Set<string>(),
});
