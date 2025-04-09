import { RecordSortDirection } from '@/object-record/record-sort/types/RecordSortDirection';

export type RecordSort = {
  id: string;
  fieldMetadataId: string;
  direction: RecordSortDirection;
};
