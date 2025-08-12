import { sortRecordsByTSRank } from '@/object-record/record-picker/multiple-record-picker/utils/sortRecordsByTSRank';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type SearchRecord } from '~/generated-metadata/graphql';

export const sortMorphItemsByTSRank = (
  morphItems: RecordPickerPickableMorphItem[],
  searchRecords: SearchRecord[],
): RecordPickerPickableMorphItem[] => {
  const sortedSearchRecords = sortRecordsByTSRank(searchRecords);

  const tsRankMap = new Map<string, number>();
  sortedSearchRecords.forEach((record, index) => {
    tsRankMap.set(record.recordId, record.tsRank ?? -index);
  });

  return morphItems.sort((a, b) => {
    if (a.isSelected && !b.isSelected) return -1;
    if (!a.isSelected && b.isSelected) return 1;

    const aTsRank = tsRankMap.get(a.recordId) ?? -1000;
    const bTsRank = tsRankMap.get(b.recordId) ?? -1000;

    return bTsRank - aTsRank;
  });
};
