import { clickOutsideListenerCallbacksStateScopeMap } from '@/ui/utilities/pointer-event/states/clickOutsideListenerCallbacksStateScopeMap';
import { clickOutsideListenerIsActivatedStateScopeMap } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedStateScopeMap';
import { clickOutsideListenerIsMouseDownInsideStateScopeMap } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideStateScopeMap';
import { lockedListenerIdState } from '@/ui/utilities/pointer-event/states/lockedListenerIdState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useClickOustideListenerStates = (componentId: string) => {
  const scopeId = getScopeIdFromComponentId(componentId);

  return {
    scopeId,
    getClickOutsideListenerCallbacksState: getState(
      clickOutsideListenerCallbacksStateScopeMap,
      scopeId,
    ),
    getClickOutsideListenerIsMouseDownInsideState: getState(
      clickOutsideListenerIsMouseDownInsideStateScopeMap,
      scopeId,
    ),
    getClickOutsideListenerIsActivatedState: getState(
      clickOutsideListenerIsActivatedStateScopeMap,
      scopeId,
    ),
    lockedListenerIdState,
  };
};
