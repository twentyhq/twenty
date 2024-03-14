import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { createState } from '@/ui/utilities/state/utils/createState';

export const recordIndexSortsState = createState<Sort[]>({
  key: 'recordIndexSortsState',
  defaultValue: [],
});
