import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const multipleRecordPickerPaginationSelector =
  createAtomComponentSelector({
    key: 'multipleRecordPickerPaginationSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        return get(multipleRecordPickerPaginationState, componentStateKey);
      },
  });
