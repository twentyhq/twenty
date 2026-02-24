import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const lastRecordTableQueryIdentifierComponentState =
  createComponentState<string>({
    key: 'lastRecordTableQueryIdentifierComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: '',
  });
