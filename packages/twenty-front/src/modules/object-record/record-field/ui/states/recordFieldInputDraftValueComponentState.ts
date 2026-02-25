import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordFieldInputDraftValueComponentState =
  createAtomComponentState<any>({
    key: 'recordFieldInputDraftValueComponentState',
    defaultValue: undefined,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
