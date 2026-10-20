import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const appliedRecordOperationKeysComponentState =
  createAtomComponentState<Set<string>>({
    key: 'appliedRecordOperationKeysComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: new Set<string>(),
  });
