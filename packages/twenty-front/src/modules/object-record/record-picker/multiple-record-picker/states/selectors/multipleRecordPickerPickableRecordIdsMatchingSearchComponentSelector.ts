import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector =
  createComponentSelectorV2<string[]>({
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
