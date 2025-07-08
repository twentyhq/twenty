import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { DialogManagerScopeInternalContext } from '../scopes/scope-internal-context/DialogManagerScopeInternalContext';
import { dialogInternalScopedState } from '../states/dialogInternalScopedState';
import { DialogOptions } from '../types/DialogOptions';

type useDialogManagerProps = {
  dialogManagerScopeId?: string;
};

export const useDialogManager = (props?: useDialogManagerProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    DialogManagerScopeInternalContext,
    props?.dialogManagerScopeId,
  );

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeDialog = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(dialogInternalScopedState({ scopeId: scopeId }), (prevState) => ({
          ...prevState,
          queue: prevState.queue.filter((dialog) => dialog.id !== id),
        }));

        removeFocusItemFromFocusStackById({ focusId: DIALOG_FOCUS_ID });
      },
    [removeFocusItemFromFocusStackById, scopeId],
  );

  const setDialogQueue = useRecoilCallback(
    ({ set }) =>
      (newValue) =>
        set(dialogInternalScopedState({ scopeId: scopeId }), (prev) => {
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
        }),
    [scopeId],
  );

  const enqueueDialog = (options?: Omit<DialogOptions, 'id'>) => {
    setDialogQueue({
      id: v4(),
      ...options,
    });
  };

  return { closeDialog, enqueueDialog };
};
