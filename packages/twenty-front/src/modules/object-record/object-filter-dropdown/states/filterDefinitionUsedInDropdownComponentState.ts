import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownComponentState =
  createComponentStateV2<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
