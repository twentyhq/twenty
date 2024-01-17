import { useRecoilCallback } from 'recoil';

import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';
import {
  ClickOutsideListenerProps,
  useListenClickOutsideV2,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

export const useClickOutsideListener = (componentId: string) => {
  // TODO: improve typing
  const scopeId = getScopeIdFromComponentId(componentId) ?? '';

  const { getClickOutsideListenerIsActivatedState } =
    useClickOustideListenerStates(componentId);

  const useListenClickOutside = <T extends Element>({
    callback,
    refs,
    enabled,
    mode,
  }: Omit<ClickOutsideListenerProps<T>, 'listenerId'>) => {
    return useListenClickOutsideV2({
      listenerId: componentId,
      refs,
      callback,
      enabled,
      mode,
    });
  };

  const toggleClickOutsideListener = useRecoilCallback(
    ({ set }) =>
      (activated: boolean) => {
        set(getClickOutsideListenerIsActivatedState(), activated);
      },
    [getClickOutsideListenerIsActivatedState],
  );

  return {
    scopeId,
    useListenClickOutside,
    toggleClickOutsideListener,
  };
};
