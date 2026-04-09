import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const singleRecordPickerSelectedIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'singleRecordPickerSelectedIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
