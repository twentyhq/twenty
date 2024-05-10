import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';
import {
  ClickOutsideListenerProps,
  useListenClickOutsideV2,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';
import { ClickOutsideListenerCallback } from '@/ui/utilities/pointer-event/types/ClickOutsideListenerCallback';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDefined } from '~/utils/isDefined';

export const useClickOutsideListener = (componentId: string) => {
  // TODO: improve typing
  const scopeId = getScopeIdFromComponentId(componentId) ?? '';

  const {
    getClickOutsideListenerIsActivatedState,
    getClickOutsideListenerCallbacksState,
  } = useClickOustideListenerStates(componentId);

  const useListenClickOutside = <T extends Element>({
    callback,
    refs,
    enabled,
    mode,
  }: Omit<ClickOutsideListenerProps<T>, 'listenerId'>) => {
    return useListenClickOutsideV2({
      listenerId: componentId,
      refs,
      callback: useRecoilCallback(
        ({ snapshot }) =>
          (event) => {
            callback(event);

            const additionalCallbacks = snapshot
              .getLoadable(getClickOutsideListenerCallbacksState)
              .getValue();

            additionalCallbacks.forEach((additionalCallback) => {
              additionalCallback.callbackFunction(event);
            });
          },
        [callback],
      ),
      enabled,
      mode,
    });
  };

  const toggleClickOutsideListener = useRecoilCallback(
    ({ set }) =>
      (activated: boolean) => {
        set(getClickOutsideListenerIsActivatedState, activated);
      },
    [getClickOutsideListenerIsActivatedState],
  );

  const registerOnClickOutsideCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ callbackFunction, callbackId }: ClickOutsideListenerCallback) => {
        const existingCallbacks = snapshot
          .getLoadable(getClickOutsideListenerCallbacksState)
          .getValue();

        const existingCallbackWithSameId = existingCallbacks.find(
          (callback) => callback.callbackId === callbackId,
        );

        if (!isDefined(existingCallbackWithSameId)) {
          const existingCallbacksWithNewCallback = existingCallbacks.concat({
            callbackId,
            callbackFunction,
          });

          set(
            getClickOutsideListenerCallbacksState,
            existingCallbacksWithNewCallback,
          );
        } else {
          const existingCallbacksWithOverwrittenCallback = [
            ...existingCallbacks,
          ];

          const indexOfExistingCallbackWithSameId =
            existingCallbacksWithOverwrittenCallback.findIndex(
              (callback) => callback.callbackId === callbackId,
            );

          existingCallbacksWithOverwrittenCallback[
            indexOfExistingCallbackWithSameId
          ] = {
            callbackId,
            callbackFunction,
          };

          set(
            getClickOutsideListenerCallbacksState,
            existingCallbacksWithOverwrittenCallback,
          );
        }
      },
    [getClickOutsideListenerCallbacksState],
  );

  const unregisterOnClickOutsideCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ callbackId }: { callbackId: string }) => {
        const existingCallbacks = snapshot
          .getLoadable(getClickOutsideListenerCallbacksState)
          .getValue();

        const indexOfCallbackToUnsubscribe = existingCallbacks.findIndex(
          (callback) => callback.callbackId === callbackId,
        );

        const callbackToUnsubscribeIsFound = indexOfCallbackToUnsubscribe > -1;

        if (callbackToUnsubscribeIsFound) {
          const newCallbacksWithoutCallbackToUnsubscribe = toSpliced(
            existingCallbacks,
            indexOfCallbackToUnsubscribe,
            1,
          );

          set(
            getClickOutsideListenerCallbacksState,
            newCallbacksWithoutCallbackToUnsubscribe,
          );
        }
      },
    [getClickOutsideListenerCallbacksState],
  );

  const useRegisterClickOutsideListenerCallback = (
    callback: ClickOutsideListenerCallback,
  ) => {
    useEffect(() => {
      registerOnClickOutsideCallback(callback);

      return () => {
        unregisterOnClickOutsideCallback({
          callbackId: callback.callbackId,
        });
      };
    }, [callback]);
  };

  return {
    scopeId,
    useListenClickOutside,
    toggleClickOutsideListener,
    useRegisterClickOutsideListenerCallback,
  };
};
