import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const availableSortDefinitionsScopedState = createComponentState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
