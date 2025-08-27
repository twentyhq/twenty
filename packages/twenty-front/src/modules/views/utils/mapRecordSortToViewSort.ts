import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type ViewSort } from '@/views/types/ViewSort';

export const mapRecordSortToViewSort = (recordSort: RecordSort): ViewSort => {
  return {
    __typename: 'ViewSort',
    ...recordSort,
  } satisfies ViewSort;
};
