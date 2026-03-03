import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { type RecordPickerSearchQuery } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerSearchQuery';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const singleRecordPickerSearchQueryComponentState =
  createAtomComponentState<RecordPickerSearchQuery | null>({
    key: 'singleRecordPickerSearchQueryComponentState',
    defaultValue: null,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
