// eslint-disable-next-line unicorn/filename-case
import { ScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopeInternalContext';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const componentContextStateMap = new Map<
  string,
  ScopeInternalContext<{ scopeId: string }>
>();
