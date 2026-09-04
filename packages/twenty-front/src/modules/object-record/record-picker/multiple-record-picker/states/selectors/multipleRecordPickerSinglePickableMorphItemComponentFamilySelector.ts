import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const multipleRecordPickerSinglePickableMorphItemComponentFamilySelector =
  createAtomComponentFamilySelector<
    RecordPickerPickableMorphItem | undefined,
    string
  >({
    key: 'multipleRecordPickerSinglePickableMorphItemComponentFamilySelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId, surfaceId, familyKey: recordId }) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState,
          { instanceId, surfaceId },
        );

        const pickableMorphItem = pickableMorphItems.find(
          ({ recordId: itemRecordId }) => itemRecordId === recordId,
        );

        return pickableMorphItem;
      },
  });
