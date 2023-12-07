import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownScopedState =
  createScopedState<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownScopedState',
    defaultValue: null,
  });
