import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type FilterScopeInternalContextProps = ScopedStateKey & {
  test?: string;
};

export const FilterScopeInternalContext =
  createScopeInternalContext<FilterScopeInternalContextProps>();
