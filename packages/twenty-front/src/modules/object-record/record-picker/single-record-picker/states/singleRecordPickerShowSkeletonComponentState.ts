import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const singleRecordPickerShowSkeletonComponentState =
  createComponentStateV2<boolean>({
    key: 'singleRecordPickerShowSkeletonComponentState',
    defaultValue: false,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
