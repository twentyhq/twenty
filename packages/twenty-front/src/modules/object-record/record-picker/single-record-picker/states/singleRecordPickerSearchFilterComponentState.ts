import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const singleRecordPickerSearchFilterComponentState =
  createComponentStateV2<string>({
    key: 'singleRecordPickerSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
