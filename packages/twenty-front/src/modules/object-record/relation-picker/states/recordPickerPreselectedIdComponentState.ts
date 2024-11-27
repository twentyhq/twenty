import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordPickerPreselectedIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'recordPickerPreselectedIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordPickerComponentInstanceContext,
});
