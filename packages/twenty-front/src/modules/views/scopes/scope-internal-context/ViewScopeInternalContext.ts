import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type ViewScopeInternalContextProps = StateScopeMapKey;

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
