import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardFiltersComponentState = createComponentState<Filter[]>({
  key: 'recordBoardFiltersComponentState',
  defaultValue: [],
});
