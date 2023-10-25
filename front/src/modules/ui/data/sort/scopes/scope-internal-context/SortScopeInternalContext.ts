import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { SortDefinition } from '../../types/SortDefinition';

type SortScopeInternalContextProps = ScopedStateKey & {
  onSortAdd?: (sort: SortDefinition) => void;
  availableSorts?: SortDefinition[];
};

export const SortScopeInternalContext =
  createScopeInternalContext<SortScopeInternalContextProps>();
