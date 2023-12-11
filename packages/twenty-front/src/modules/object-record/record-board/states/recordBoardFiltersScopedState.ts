import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const recordBoardFiltersScopedState = createScopedState<Filter[]>({
  key: 'recordBoardFiltersScopedState',
  defaultValue: [],
});
