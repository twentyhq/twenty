import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';

export const upsertMorphItem = (
  morphItems: RecordPickerPickableMorphItem[],
  morphItem: RecordPickerPickableMorphItem,
) => {
  const existingIndex = morphItems.findIndex(
    ({ recordId }) => recordId === morphItem.recordId,
  );

  if (existingIndex === -1) {
    return [morphItem, ...morphItems];
  }

  return morphItems.map((existingItem, index) =>
    index === existingIndex ? morphItem : existingItem,
  );
};
