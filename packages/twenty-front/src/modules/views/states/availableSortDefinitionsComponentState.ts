import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const availableSortDefinitionsComponentState = createComponentStateV2<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
