import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type SnackBarManagerScopeInternalContextProps = StateScopeMapKey;

export const SnackBarManagerScopeInternalContext =
  createScopeInternalContext<SnackBarManagerScopeInternalContextProps>();
