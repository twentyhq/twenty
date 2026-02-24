import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const singleRecordPickerSearchFilterComponentState =
  createComponentState<string>({
    key: 'singleRecordPickerSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
