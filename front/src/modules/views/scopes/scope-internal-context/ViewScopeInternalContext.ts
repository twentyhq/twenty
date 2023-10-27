import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type ViewScopeInternalContextProps = ScopedStateKey;

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
