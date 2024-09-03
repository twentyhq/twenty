import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const availableFilterDefinitionsInstanceState = createInstanceState<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
