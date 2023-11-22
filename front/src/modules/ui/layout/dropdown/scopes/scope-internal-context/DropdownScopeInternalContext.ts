import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type DropdownScopeInternalContextProps = ScopedStateKey;

export const DropdownScopeInternalContext =
  createScopeInternalContext<DropdownScopeInternalContextProps>();
