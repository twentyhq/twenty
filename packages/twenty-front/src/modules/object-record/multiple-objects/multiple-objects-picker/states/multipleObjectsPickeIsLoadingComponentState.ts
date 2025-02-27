import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleObjectsPickeIsLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'multipleObjectsPickeIsLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: MultipleObjectsPickerComponentInstanceContext,
  });
