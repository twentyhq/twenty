import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

import { Sort } from '../../types/Sort';

type ObjectSortDropdownScopeInternalContextProps = RecoilComponentStateKey & {
  onSortSelect?: (sort: Sort) => void;
};

export const ObjectSortDropdownScopeInternalContext =
  createScopeInternalContext<ObjectSortDropdownScopeInternalContextProps>();
