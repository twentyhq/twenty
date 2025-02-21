import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createState } from '@ui/utilities/state/utils/createState';

export const recordIndexSortsState = createState<RecordSort[]>({
  key: 'recordIndexSortsState',
  defaultValue: [],
});
