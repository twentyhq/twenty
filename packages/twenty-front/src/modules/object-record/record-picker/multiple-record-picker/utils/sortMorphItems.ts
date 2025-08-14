import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type SearchRecord } from '~/generated-metadata/graphql';

export const sortMorphItems = (
  morphItems: RecordPickerPickableMorphItem[],
  searchRecords: SearchRecord[],
): RecordPickerPickableMorphItem[] => {
  const indexByRecordId = new Map<string, number>();
  searchRecords.forEach((record, index) => {
    indexByRecordId.set(record.recordId, index);
  });

  return morphItems.sort((a, b) => {
    if (a.isSelected && !b.isSelected) return -1;
    if (!a.isSelected && b.isSelected) return 1;

    const aRank = indexByRecordId.get(a.recordId);
    const bRank = indexByRecordId.get(b.recordId);

    return (aRank ?? -1) - (bRank ?? -1);
  });
};
