import { ComponentStateKey, createScopeInternalContext } from 'twenty-ui';

import { Sort } from '../../types/Sort';

type ObjectSortDropdownScopeInternalContextProps = ComponentStateKey & {
  onSortSelect?: (sort: Sort) => void;
};

export const ObjectSortDropdownScopeInternalContext =
  createScopeInternalContext<ObjectSortDropdownScopeInternalContextProps>();
