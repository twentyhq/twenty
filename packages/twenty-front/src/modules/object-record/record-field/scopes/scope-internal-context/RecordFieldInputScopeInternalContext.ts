import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type RecordFieldInputScopeInternalContextProps = StateScopeMapKey;

export const RecordFieldInputScopeInternalContext =
  createScopeInternalContext<RecordFieldInputScopeInternalContextProps>();
