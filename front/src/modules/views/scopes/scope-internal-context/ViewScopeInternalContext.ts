import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type ViewScopeInternalContextProps = ScopedStateKey & {
  test?: string;
};

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
