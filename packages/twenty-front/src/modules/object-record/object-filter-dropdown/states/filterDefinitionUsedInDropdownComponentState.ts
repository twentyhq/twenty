import { createComponentState } from 'twenty-ui';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownComponentState =
  createComponentState<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownComponentState',
    defaultValue: null,
  });
