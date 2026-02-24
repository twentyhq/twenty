import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const singleRecordPickerSelectedIdComponentState = createComponentState<
  string | undefined
>({
  key: 'singleRecordPickerSelectedIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: SingleRecordPickerComponentInstanceContext,
});
