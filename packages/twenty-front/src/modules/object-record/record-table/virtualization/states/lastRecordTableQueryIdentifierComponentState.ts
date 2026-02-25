import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastRecordTableQueryIdentifierComponentState =
  createAtomComponentState<string>({
    key: 'lastRecordTableQueryIdentifierComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: '',
  });
