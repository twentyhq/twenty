import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export type ObjectRecordAndSelected = ObjectRecordForSelect & {
  selected: boolean;
};

export const multipleRecordPickerIsSelectedComponentFamilyState =
  createComponentFamilyStateV2<ObjectRecordAndSelected | undefined, string>({
    key: 'multipleRecordPickerIsSelectedComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
