import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';

export const sortRecordGroupDefinitions = (
  recordGroupDefinitions: RecordGroupDefinition[],
  recordGroupSort: RecordGroupSort,
) => {
  switch (recordGroupSort) {
    case RecordGroupSort.MANUAL:
    default:
      return recordGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort(
          (boardGroupA, boardGroupB) =>
            boardGroupA.position - boardGroupB.position,
        );
    case RecordGroupSort.ALPHABETICAL:
      return recordGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort((boardGroupA, boardGroupB) => {
          const a = boardGroupA.title.toLowerCase();
          const b = boardGroupB.title.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
    case RecordGroupSort.REVERSE_ALPHABETICAL:
      return recordGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort((boardGroupA, boardGroupB) => {
          const a = boardGroupA.title.toLowerCase();
          const b = boardGroupB.title.toLowerCase();
          return a > b ? -1 : a < b ? 1 : 0;
        });
  }
};
