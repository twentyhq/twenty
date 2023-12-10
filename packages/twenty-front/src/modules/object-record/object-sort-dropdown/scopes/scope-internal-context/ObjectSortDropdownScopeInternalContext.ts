import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { Sort } from '../../types/Sort';

type ObjectSortDropdownScopeInternalContextProps = ScopedStateKey & {
  onSortSelect?: (sort: Sort) => void;
};

export const ObjectSortDropdownScopeInternalContext =
  createScopeInternalContext<ObjectSortDropdownScopeInternalContextProps>();
