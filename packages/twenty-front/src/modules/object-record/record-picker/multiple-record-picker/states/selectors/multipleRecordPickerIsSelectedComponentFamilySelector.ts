import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const multipleRecordPickerIsSelectedComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId, familyKey: recordId }) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState,
          { instanceId },
        );

        const pickableMorphItem = pickableMorphItems.find(
          ({ recordId: itemRecordId }) => itemRecordId === recordId,
        );

        return pickableMorphItem?.isSelected ?? false;
      },
  });
