import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type DialogManagerScopeInternalContextProps = ComponentStateKey;

export const DialogManagerScopeInternalContext =
  createScopeInternalContext<DialogManagerScopeInternalContextProps>();
