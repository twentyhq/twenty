import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type MetadataObjectScopeInternalContextProps = ScopedStateKey & {
  objectNamePlural: string;
};

export const MetadataObjectScopeInternalContext =
  createScopeInternalContext<MetadataObjectScopeInternalContextProps>();
