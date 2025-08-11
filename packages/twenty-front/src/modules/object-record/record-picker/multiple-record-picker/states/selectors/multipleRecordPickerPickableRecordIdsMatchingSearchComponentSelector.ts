import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector =
  createComponentSelector({
    key: 'multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId,
          }),
        );

        return pickableMorphItems
          .filter(({ isMatchingSearchFilter }) => isMatchingSearchFilter)
          .map(({ recordId }) => recordId);
      },
  });
