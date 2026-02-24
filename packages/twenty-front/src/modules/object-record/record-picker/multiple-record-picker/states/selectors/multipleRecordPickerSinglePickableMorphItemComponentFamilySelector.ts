import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelectorV2';

export const multipleRecordPickerSinglePickableMorphItemComponentFamilySelector =
  createComponentFamilySelectorV2<
    RecordPickerPickableMorphItem | undefined,
    string
  >({
    key: 'multipleRecordPickerSinglePickableMorphItemComponentFamilySelector',
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

        return pickableMorphItem;
      },
  });
