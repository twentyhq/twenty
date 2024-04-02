import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

import { Sort } from '../../types/Sort';

type ObjectSortDropdownScopeInternalContextProps = ComponentStateKey & {
  onSortSelect?: (sort: Sort) => void;
};

export const ObjectSortDropdownScopeInternalContext =
  createScopeInternalContext<ObjectSortDropdownScopeInternalContextProps>();
