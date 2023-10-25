import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

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

  const {
    currentViewId,
    sorts,
    createViewSorts,
    updateViewSorts,
    savedSortsByKey,
    deleteViewSorts,
    refetch,
  } = useViewSortsInternal();

  const { currentViewId, setCurrentViewId } = useViewStates(viewScopeId);

  return {
    scopeId,
    currentViewId,
    setCurrentViewId,
  };
};
