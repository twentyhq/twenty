import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopeInternalContextOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

import { useViewSortsInternal } from './useViewSortsInternal';
import { useViewStates } from './useViewStates';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = ({ viewScopeId }: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );

  const { createViewSorts, persistSorts } = useViewSortsInternal(scopeId);

  const { currentViewId, setCurrentViewId } = useViewStates(scopeId);

  const { canPersistViewFields, onViewBarReset, ViewBarRecoilScopeContext } =
    useScopeInternalContextOrThrow(ViewScopeInternalContext);

  return {
    scopeId,
    currentViewId,
    setCurrentViewId,
    createViewSorts,
    persistSorts,
    canPersistViewFields,
    onViewBarReset,
    ViewBarRecoilScopeContext,
  };
};
