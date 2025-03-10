import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { RecordPickerSearchQuery } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerSearchQuery';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const singleRecordPickerSearchQueryComponentState =
  createComponentStateV2<RecordPickerSearchQuery | null>({
    key: 'singleRecordPickerSearchQueryComponentState',
    defaultValue: null,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
