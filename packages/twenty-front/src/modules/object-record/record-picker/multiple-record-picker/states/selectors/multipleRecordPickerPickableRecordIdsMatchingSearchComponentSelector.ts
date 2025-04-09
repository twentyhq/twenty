import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector =
  createComponentSelectorV2({
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
