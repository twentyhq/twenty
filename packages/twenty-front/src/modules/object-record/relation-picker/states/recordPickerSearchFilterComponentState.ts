import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordPickerSearchFilterComponentState =
  createComponentStateV2<string>({
    key: 'recordPickerSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: RecordPickerComponentInstanceContext,
  });
