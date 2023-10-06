import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type DropdownScopeInternalContextProps = { scopeId: string };

export const DropdownScopeInternalContext =
  createScopeInternalContext<DropdownScopeInternalContextProps>();
