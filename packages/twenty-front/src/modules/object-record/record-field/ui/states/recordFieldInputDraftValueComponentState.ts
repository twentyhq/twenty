import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordFieldInputDraftValueComponentState =
  createComponentStateV2<any>({
    key: 'recordFieldInputDraftValueComponentState',
    defaultValue: undefined,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
