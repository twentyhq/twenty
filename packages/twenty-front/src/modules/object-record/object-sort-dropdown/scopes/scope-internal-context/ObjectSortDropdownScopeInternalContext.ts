import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { Sort } from '../../types/Sort';

type ObjectSortDropdownScopeInternalContextProps = StateScopeMapKey & {
  onSortSelect?: (sort: Sort) => void;
};

export const ObjectSortDropdownScopeInternalContext =
  createScopeInternalContext<ObjectSortDropdownScopeInternalContextProps>();
