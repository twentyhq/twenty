import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createComponentSelector } from '@/ui/utilities/state/jotai/utils/createComponentSelector';

export const multipleRecordPickerPaginationSelector = createComponentSelector({
  key: 'multipleRecordPickerPaginationSelector',
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  get:
    (componentStateKey) =>
    ({ get }) => {
      return get(multipleRecordPickerPaginationState, componentStateKey);
    },
});
