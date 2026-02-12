import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';

import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { dialogInternalComponentState } from '@/ui/feedback/dialog-manager/states/dialogInternalComponentState';
import { type DialogOptions } from '@/ui/feedback/dialog-manager/types/DialogOptions';

export const useDialogManager = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    DialogComponentInstanceContext,
  );

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeDialog = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(
          dialogInternalComponentState.atomFamily({
            instanceId: componentInstanceId,
          }),
          (prevState) => ({
            ...prevState,
            queue: prevState.queue.filter((dialog) => dialog.id !== id),
          }),
        );

        removeFocusItemFromFocusStackById({ focusId: DIALOG_FOCUS_ID });
      },
    [componentInstanceId, removeFocusItemFromFocusStackById],
  );

  const setDialogQueue = useRecoilCallback(
    ({ set }) =>
      (newValue) =>
        set(
          dialogInternalComponentState.atomFamily({
            instanceId: componentInstanceId,
          }),
          (prev) => {
            if (prev.queue.length >= prev.maxQueue) {
              return {
                ...prev,
                queue: [...prev.queue.slice(1), newValue] as DialogOptions[],
              };
            }

            return {
              ...prev,
              queue: [...prev.queue, newValue] as DialogOptions[],
            };
          },
        ),
    [componentInstanceId],
  );

  const enqueueDialog = (options?: Omit<DialogOptions, 'id'>) => {
    setDialogQueue({
      id: v4(),
      ...options,
    });
  };

  return { closeDialog, enqueueDialog };
};
