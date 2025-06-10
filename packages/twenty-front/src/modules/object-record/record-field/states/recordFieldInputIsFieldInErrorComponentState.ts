import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordFieldInputIsFieldInErrorComponentState =
  createComponentStateV2<boolean>({
    key: 'recordFieldInputIsFieldInErrorComponentState',
    defaultValue: false,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });
