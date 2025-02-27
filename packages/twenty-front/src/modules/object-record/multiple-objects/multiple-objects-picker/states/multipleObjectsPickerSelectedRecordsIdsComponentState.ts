import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleObjectsPickerSelectedRecordsIdsComponentState =
  createComponentStateV2<string[]>({
    key: 'multipleObjectsPickerSelectedRecordsIdsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleObjectsPickerComponentInstanceContext,
  });
