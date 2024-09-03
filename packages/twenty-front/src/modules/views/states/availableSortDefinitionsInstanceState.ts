import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const availableSortDefinitionsInstanceState = createInstanceState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
