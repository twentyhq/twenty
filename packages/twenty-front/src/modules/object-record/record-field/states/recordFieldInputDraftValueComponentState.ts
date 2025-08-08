import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldInputDraftValueComponentState =
  createComponentState<any>({
    key: 'recordFieldInputDraftValueComponentState',
    defaultValue: undefined,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
