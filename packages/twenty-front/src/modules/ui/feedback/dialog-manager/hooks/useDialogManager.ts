import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

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

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const closeDialog = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(dialogInternalScopedState({ scopeId: scopeId }), (prevState) => ({
          ...prevState,
          queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
        }));
        goBackToPreviousHotkeyScope();
      },
    [goBackToPreviousHotkeyScope, scopeId],
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
