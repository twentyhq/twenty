import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { Sort } from '../../types/Sort';
import { SortDefinition } from '../../types/SortDefinition';

type SortScopeInternalContextProps = ScopedStateKey & {
  onSortAdd?: (sort: Sort) => void;
  availableSorts?: SortDefinition[];
};

export const SortScopeInternalContext =
  createScopeInternalContext<SortScopeInternalContextProps>();
