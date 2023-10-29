import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { Filter } from '../../types/Filter';

type FilterScopeInternalContextProps = ScopedStateKey & {
  onFilterSelect?: (sort: Filter) => void;
};

export const FilterScopeInternalContext =
  createScopeInternalContext<FilterScopeInternalContextProps>();
