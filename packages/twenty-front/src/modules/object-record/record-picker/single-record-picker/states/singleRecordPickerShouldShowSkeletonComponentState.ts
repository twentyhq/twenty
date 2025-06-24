import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const singleRecordPickerShouldShowSkeletonComponentState =
  createComponentStateV2<boolean>({
    key: 'singleRecordPickerShouldShowSkeletonComponentState',
    defaultValue: false,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
