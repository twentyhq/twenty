import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export type ObjectRecordAndSelected = ObjectRecordForSelect & {
  selected: boolean;
};

export const multipleObjectsPickerIsSelectedComponentFamilyState =
  createComponentFamilyStateV2<ObjectRecordAndSelected | undefined, string>({
    key: 'multipleObjectsPickerIsSelectedComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: MultipleObjectsPickerComponentInstanceContext,
  });
