import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { type RecordPickerSearchQuery } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerSearchQuery';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const singleRecordPickerSearchQueryComponentState =
  createComponentState<RecordPickerSearchQuery | null>({
    key: 'singleRecordPickerSearchQueryComponentState',
    defaultValue: null,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
