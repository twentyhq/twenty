import { Snapshot } from 'recoil';

import { getInjectedScopedState } from '@/ui/utilities/recoil-scope/utils/getInjectedScopedState';
import { getSnapshotStateValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDefined } from '~/utils/isDefined';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';

import { getViewInjectedStates } from './getViewInjectedStates';

export const getViewSnapshotInjectedStates = ({
  snapshot,
  viewScopeId,
  viewId,
}: {
  snapshot: Snapshot;
  viewScopeId: string;
  viewId?: string;
}) => {
  const currentViewId = getSnapshotStateValue(
    snapshot,
    getInjectedScopedState(currentViewIdScopedState, viewScopeId),
  );

  const familyItemId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

  if (!isDefined(familyItemId)) {
    throw new Error('familyItemId is not defined');
  }

  const currentView = getSnapshotStateValue(
    snapshot,
    currentViewScopedSelector(viewScopeId),
  );

  const viewInjectedStates = getViewInjectedStates({
    viewScopeId,
    familyItemId,
  });

  return {
    currentViewId,
    currentView,
    viewInjectedStates,
  };
};
