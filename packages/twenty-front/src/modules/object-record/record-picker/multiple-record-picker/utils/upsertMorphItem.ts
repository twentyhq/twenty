import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';

export const upsertMorphItem = (
  morphItems: RecordPickerPickableMorphItem[],
  morphItem: RecordPickerPickableMorphItem,
) => [
  ...morphItems.filter(({ recordId }) => recordId !== morphItem.recordId),
  morphItem,
];
