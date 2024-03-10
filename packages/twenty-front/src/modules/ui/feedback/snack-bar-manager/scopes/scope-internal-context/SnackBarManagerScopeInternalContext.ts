import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type SnackBarManagerScopeInternalContextProps = ComponentStateKey;

export const SnackBarManagerScopeInternalContext =
  createScopeInternalContext<SnackBarManagerScopeInternalContextProps>();
