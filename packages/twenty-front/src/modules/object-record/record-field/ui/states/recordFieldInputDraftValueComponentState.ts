import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordFieldInputDraftValueComponentState =
  createComponentState<any>({
    key: 'recordFieldInputDraftValueComponentState',
    defaultValue: undefined,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
