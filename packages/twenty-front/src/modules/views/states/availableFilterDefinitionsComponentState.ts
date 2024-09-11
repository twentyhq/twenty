import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const availableFilterDefinitionsComponentState = createComponentStateV2<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
