import { createScopeInternalContext } from '@/scopes-internal/utils/createScopeInternalContext';

type DropdownScopeInternalContextProps = { scopeId: string };

export const DropdownScopeInternalContext =
  createScopeInternalContext<DropdownScopeInternalContextProps>();
