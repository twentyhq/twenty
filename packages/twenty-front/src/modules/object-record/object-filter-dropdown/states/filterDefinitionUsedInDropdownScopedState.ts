import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownScopedState =
  createComponentState<FilterDefinition | null>({
    key: 'filterDefinitionUsedInDropdownScopedState',
    defaultValue: null,
  });
