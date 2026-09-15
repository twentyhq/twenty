import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type ViewSort } from '@/views/types/ViewSort';

export const mapRecordSortToViewSort = (recordSort: RecordSort): ViewSort => {
  return {
    id: recordSort.id,
    fieldMetadataId: recordSort.fieldMetadataId,
    direction: recordSort.direction,
    subFieldName: recordSort.subFieldName ?? null,
  };
};
