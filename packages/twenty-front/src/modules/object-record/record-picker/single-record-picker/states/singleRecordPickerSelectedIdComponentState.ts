import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const singleRecordPickerSelectedIdComponentState = createComponentState<
  string | undefined
>({
  key: 'singleRecordPickerSelectedIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: SingleRecordPickerComponentInstanceContext,
});
