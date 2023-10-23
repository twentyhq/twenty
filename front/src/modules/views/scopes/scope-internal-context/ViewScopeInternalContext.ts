import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { View } from '~/generated/graphql';

type ViewScopeInternalContextProps = ScopedStateKey & {
  test?: string;
  canPersistViewFields?: boolean;
  defaultViewName?: string;
  onCurrentViewSubmit?: () => void | Promise<void>;
  onViewBarReset?: () => void;
  onViewCreate?: (view: View) => void | Promise<void>;
  onViewEdit?: (view: View) => void | Promise<void>;
  onViewRemove?: (viewId: string) => void | Promise<void>;
  onViewSelect?: (viewId: string) => void | Promise<void>;
  onImport?: () => void | Promise<void>;
  ViewBarRecoilScopeContext: RecoilScopeContext;
};

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
