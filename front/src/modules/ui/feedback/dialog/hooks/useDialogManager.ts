import { useRecoilCallback } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
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

  const setDialogInternal = useSetRecoilScopedStateV2(
    dialogInternalScopedState,
    scopeId,
  );

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const closeDialog = (id: string) => {
    setDialogInternal((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
    goBackToPreviousHotkeyScope();
  };

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

  return { closeDialog, setDialogQueue };
};
