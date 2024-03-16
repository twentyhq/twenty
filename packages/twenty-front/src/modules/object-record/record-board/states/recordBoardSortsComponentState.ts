import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardSortsComponentState = createComponentState<Sort[]>({
  key: 'recordBoardSortsComponentState',
  defaultValue: [],
});
