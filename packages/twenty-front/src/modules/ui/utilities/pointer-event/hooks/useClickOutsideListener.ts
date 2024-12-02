import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';

import { ClickOutsideListenerCallback } from '@/ui/utilities/pointer-event/types/ClickOutsideListenerCallback';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDefined } from '~/utils/isDefined';

export const useClickOutsideListener = (componentId: string) => {
  const {
    getClickOutsideListenerIsActivatedState,
    getClickOutsideListenerCallbacksState,
    getClickOutsideListenerMouseDownHappenedState,
  } = useClickOustideListenerStates(componentId);

  const toggleClickOutsideListener = useRecoilCallback(
    ({ set }) =>
      (activated: boolean) => {
        set(getClickOutsideListenerIsActivatedState, activated);

        if (!activated) {
          set(getClickOutsideListenerMouseDownHappenedState, false);
        }
      },
    [
      getClickOutsideListenerIsActivatedState,
      getClickOutsideListenerMouseDownHappenedState,
    ],
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
    toggleClickOutsideListener,
    useRegisterClickOutsideListenerCallback,
  };
};
