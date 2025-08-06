import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';

export const multipleRecordPickerIsSelectedComponentFamilySelector =
  createComponentFamilySelector<boolean, string>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId, familyKey: recordId }) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId,
          }),
        );

        const pickableMorphItem = pickableMorphItems.find(
          ({ recordId: itemRecordId }) => itemRecordId === recordId,
        );

        return pickableMorphItem?.isSelected ?? false;
      },
  });
