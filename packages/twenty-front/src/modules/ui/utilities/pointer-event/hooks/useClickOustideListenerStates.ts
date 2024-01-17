import { clickOutsideListenerIsEnabledStateScopeMap } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsEnabledStateScopeMap';
import { clickOutsideListenerIsMouseDownInsideStateScopeMap } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideStateScopeMap';
import { lockedListenerIdState } from '@/ui/utilities/pointer-event/states/lockedListenerIdState';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useClickOustideListenerStates = ({
  listenerId,
}: {
  listenerId: string;
}) => {
  const scopeId = `listener-${listenerId}-scope`;

  return {
    scopeId,
    getClickOutsideListenerIsMouseDownInsideState: getState(
      clickOutsideListenerIsMouseDownInsideStateScopeMap,
      scopeId,
    ),
    getClickOutsideListenerIsEnabledState: getState(
      clickOutsideListenerIsEnabledStateScopeMap,
      scopeId,
    ),
    lockedListenerIdState,
  };
};
