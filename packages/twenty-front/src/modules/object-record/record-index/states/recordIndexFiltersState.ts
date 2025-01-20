import { createState } from '@ui/utilities/state/utils/createState';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const recordIndexFiltersState = createState<RecordFilter[]>({
  key: 'recordIndexFiltersState',
  defaultValue: [],
});
