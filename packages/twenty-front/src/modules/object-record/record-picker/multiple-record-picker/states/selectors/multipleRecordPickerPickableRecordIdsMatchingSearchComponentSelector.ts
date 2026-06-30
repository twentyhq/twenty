import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState,
          componentStateKey,
        );

        return pickableMorphItems
          .filter(({ isMatchingSearchFilter }) => isMatchingSearchFilter)
          .map(({ recordId }) => recordId);
      },
  });
