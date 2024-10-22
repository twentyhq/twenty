import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

type FavoriteFoldersScopeInternalContextProps = RecoilComponentStateKey;

export const FavoriteFoldersScopeInternalContext =
  createScopeInternalContext<FavoriteFoldersScopeInternalContextProps>();
