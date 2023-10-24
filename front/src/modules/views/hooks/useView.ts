import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

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

  const { currentViewId, setCurrentViewId, availableSorts, setAvailableSorts } =
    useViewStates({
      scopeId,
    });

  return {
    scopeId,
    currentViewId,
    setCurrentViewId,
    availableSorts,
    setAvailableSorts,
  };
};
