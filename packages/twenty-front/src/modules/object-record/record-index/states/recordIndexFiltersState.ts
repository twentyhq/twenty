import { createState } from 'twenty-ui';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const recordIndexFiltersState = createState<RecordFilter[]>({
  key: 'recordIndexFiltersState',
  defaultValue: [],
});
