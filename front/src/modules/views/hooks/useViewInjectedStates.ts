import { useRecoilState, useRecoilValue } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getInjectedScopedState } from '@/ui/utilities/recoil-scope/utils/getInjectedScopedState';
import { isDefined } from '~/utils/isDefined';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';
import { getViewInjectedStates } from '../utils/getViewInjectedStates';

export const useViewInjectedStates = (args?: {
  customViewScopeId?: string;
  viewId?: string;
}) => {
  const { customViewScopeId, viewId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    customViewScopeId,
  );

  // View
  const [currentViewId] = useRecoilState(
    getInjectedScopedState(currentViewIdScopedState, scopeId),
  );

  const familyItemId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

  if (!isDefined(familyItemId)) {
    throw new Error('familyItemId is not defined');
  }

  const currentView = useRecoilValue(currentViewScopedSelector(scopeId));

  const viewInjectedStates = getViewInjectedStates({
    viewScopeId: scopeId,
    familyItemId,
  });

  return {
    currentViewId,
    currentView,
    viewInjectedStates,
  };
};
