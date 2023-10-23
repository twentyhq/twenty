import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopeInternalContextOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

import { useViewStates } from './useViewStates';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewScopeId,
  );

  const { canPersistViewFields, onViewBarReset, ViewBarRecoilScopeContext } =
    useScopeInternalContextOrThrow(ViewScopeInternalContext);

  const { currentViewId, setCurrentViewId } = useViewStates({ scopeId });

  return {
    scopeId,
    canPersistViewFields,
    onViewBarReset,
    ViewBarRecoilScopeContext,
    currentViewId,
    setCurrentViewId,
  };
};
