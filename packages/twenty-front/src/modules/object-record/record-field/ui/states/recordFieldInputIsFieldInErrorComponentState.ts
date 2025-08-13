import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldInputIsFieldInErrorComponentState =
  createComponentState<boolean>({
    key: 'recordFieldInputIsFieldInErrorComponentState',
    defaultValue: false,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
