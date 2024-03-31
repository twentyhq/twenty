import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const availableFilterDefinitionsComponentState = createComponentState<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsComponentState',
  defaultValue: [],
});
