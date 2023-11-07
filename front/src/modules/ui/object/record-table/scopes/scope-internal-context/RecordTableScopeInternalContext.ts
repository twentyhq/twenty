import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type RecordTableScopeInternalContextProps = ScopedStateKey & {
  onColumnsChange: (columns: string[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
