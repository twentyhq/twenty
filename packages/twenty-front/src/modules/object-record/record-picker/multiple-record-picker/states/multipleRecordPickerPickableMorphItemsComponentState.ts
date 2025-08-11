import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const multipleRecordPickerPickableMorphItemsComponentState =
  createComponentState<RecordPickerPickableMorphItem[]>({
    key: 'multipleRecordPickerPickableMorphItemsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
