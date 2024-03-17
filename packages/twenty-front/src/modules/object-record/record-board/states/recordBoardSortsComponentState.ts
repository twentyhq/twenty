import { createComponentState } from 'twenty-ui';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';

export const recordBoardSortsComponentState = createComponentState<Sort[]>({
  key: 'recordBoardSortsComponentState',
  defaultValue: [],
});
