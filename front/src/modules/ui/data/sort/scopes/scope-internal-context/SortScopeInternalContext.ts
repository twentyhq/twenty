import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type SortScopeInternalContextProps = ScopedStateKey & {
  test?: string;
};

export const SortScopeInternalContext =
  createScopeInternalContext<SortScopeInternalContextProps>();
