import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type RelationPickerScopeInternalContextProps = StateScopeMapKey;

export const RelationPickerScopeInternalContext =
  createScopeInternalContext<RelationPickerScopeInternalContextProps>();
