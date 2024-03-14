import { clickOutsideListenerCallbacksComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerCallbacksComponentState';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerIsMouseDownInsideComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideComponentState';
import { lockedListenerIdState } from '@/ui/utilities/pointer-event/states/lockedListenerIdState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useClickOustideListenerStates = (componentId: string) => {
  const scopeId = getScopeIdFromComponentId(componentId);

  return {
    scopeId,
    getClickOutsideListenerCallbacksState: extractComponentState(
      clickOutsideListenerCallbacksComponentState,
      scopeId,
    ),
    getClickOutsideListenerIsMouseDownInsideState: extractComponentState(
      clickOutsideListenerIsMouseDownInsideComponentState,
      scopeId,
    ),
    getClickOutsideListenerIsActivatedState: extractComponentState(
      clickOutsideListenerIsActivatedComponentState,
      scopeId,
    ),
    lockedListenerIdState,
  };
};
