import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardSortsStateScopeMap = createStateScopeMap<Sort[]>({
  key: 'recordBoardSortsStateScopeMap',
  defaultValue: [],
});
