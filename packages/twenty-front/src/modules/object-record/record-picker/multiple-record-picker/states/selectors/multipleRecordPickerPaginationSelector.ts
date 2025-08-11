import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const multipleRecordPickerPaginationSelector = createComponentSelector({
  key: 'multipleRecordPickerPaginationSelector',
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      return get(
        multipleRecordPickerPaginationState.atomFamily({
          instanceId,
        }),
      );
    },
});
