import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const multipleRecordPickerPaginationSelector = createComponentSelectorV2(
  {
    key: 'multipleRecordPickerPaginationSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        return get(multipleRecordPickerPaginationState, componentStateKey);
      },
  },
);
