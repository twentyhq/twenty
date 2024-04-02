import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownComponentState =
  createComponentState<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownComponentState',
    defaultValue: null,
  });
