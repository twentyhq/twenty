import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardFiltersScopedState = createStateScopeMap<Filter[]>({
  key: 'recordBoardFiltersScopedState',
  defaultValue: [],
});
