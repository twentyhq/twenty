import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RecordPickerSearchQuery } from '@/object-record/record-picker/types/RecordPickerSearchQuery';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordPickerSearchQueryComponentState =
  createComponentStateV2<RecordPickerSearchQuery | null>({
    key: 'recordPickerSearchQueryComponentState',
    defaultValue: null,
    componentInstanceContext: RecordPickerComponentInstanceContext,
  });
