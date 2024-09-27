import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

type SelectableListScopeInternalContextProps = RecoilComponentStateKey;

export const SelectableListScopeInternalContext =
  createScopeInternalContext<SelectableListScopeInternalContextProps>();
