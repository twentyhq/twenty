import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilter } from '@/views/types/ViewFilter';

export const mapRecordFilterToViewFilter = (
  recordFilter: RecordFilter,
): ViewFilter => {
  return {
    __typename: 'ViewFilter',
    ...recordFilter,
  } satisfies ViewFilter;
};
