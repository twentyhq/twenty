import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';

export const sortRecordGroupDefinitions = (
  recordGroupDefinitions: RecordGroupDefinition[],
  recordGroupSort: RecordGroupSort,
) => {
  const visibleRecordGroups = recordGroupDefinitions.filter(
    (recordGroup) => recordGroup.isVisible,
  );

  const compareAlphabetical = (a: string, b: string, reverse = false) => {
    if (a < b) return reverse ? 1 : -1;
    if (a > b) return reverse ? -1 : 1;
    return 0;
  };

  switch (recordGroupSort) {
    case RecordGroupSort.Alphabetical:
      return visibleRecordGroups.sort((a, b) =>
        compareAlphabetical(a.title.toLowerCase(), b.title.toLowerCase()),
      );
    case RecordGroupSort.ReverseAlphabetical:
      return visibleRecordGroups.sort((a, b) =>
        compareAlphabetical(a.title.toLowerCase(), b.title.toLowerCase(), true),
      );
    case RecordGroupSort.Manual:
    default:
      return visibleRecordGroups.sort((a, b) => a.position - b.position);
  }
};
