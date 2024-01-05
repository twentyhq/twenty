import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownScopedState =
  createStateScopeMap<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownScopedState',
    defaultValue: null,
  });
