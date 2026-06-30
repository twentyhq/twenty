import { useCallback } from 'react';
import { v4 } from 'uuid';

import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';

import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { dialogInternalComponentState } from '@/ui/feedback/dialog-manager/states/dialogInternalComponentState';
import { type DialogOptions } from '@/ui/feedback/dialog-manager/types/DialogOptions';
import { useStore } from 'jotai';

export const useDialogManager = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    DialogComponentInstanceContext,
  );

  const store = useStore();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeDialog = useCallback(
    (id: string) => {
      store.set(
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
    [componentInstanceId, removeFocusItemFromFocusStackById, store],
  );

  const setDialogQueue = useCallback(
    (newValue: DialogOptions) =>
      store.set(
        dialogInternalComponentState.atomFamily({
          instanceId: componentInstanceId,
        }),
        (prev) => {
          if (prev.queue.length >= prev.maxQueue) {
            return {
              ...prev,
              queue: [...prev.queue.slice(1), newValue],
            };
          }

          return {
            ...prev,
            queue: [...prev.queue, newValue],
          };
        },
      ),
    [componentInstanceId, store],
  );

  const enqueueDialog = (options?: Omit<DialogOptions, 'id'>) => {
    setDialogQueue({
      id: v4(),
      ...options,
    });
  };

  return { closeDialog, enqueueDialog };
};
