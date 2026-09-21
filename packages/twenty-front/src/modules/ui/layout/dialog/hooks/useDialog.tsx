import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useDialog = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const closeDialog = useCallback(
    (dialogId: string) => {
      const isDialogOpened = store.get(
        isDialogOpenedComponentState.atomFamily({
          instanceId: dialogId,
        }),
      );

      if (!isDialogOpened) {
        return;
      }

      removeFocusItemFromFocusStackById({
        focusId: dialogId,
      });

      store.set(
        isDialogOpenedComponentState.atomFamily({
          instanceId: dialogId,
        }),
        false,
      );
    },
    [store, removeFocusItemFromFocusStackById],
  );

  const openDialog = useCallback(
    (dialogId: string) => {
      const isDialogOpened = store.get(
        isDialogOpenedComponentState.atomFamily({
          instanceId: dialogId,
        }),
      );

      if (isDialogOpened) {
        return;
      }

      store.set(
        isDialogOpenedComponentState.atomFamily({
          instanceId: dialogId,
        }),
        true,
      );

      pushFocusItemToFocusStack({
        focusId: dialogId,
        component: {
          type: FocusComponentType.MODAL,
          instanceId: dialogId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: false,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [store, pushFocusItemToFocusStack],
  );

  const toggleDialog = useCallback(
    (dialogId: string) => {
      const isDialogOpened = store.get(
        isDialogOpenedComponentState.atomFamily({
          instanceId: dialogId,
        }),
      );

      if (isDialogOpened) {
        closeDialog(dialogId);
        return;
      }

      openDialog(dialogId);
    },
    [store, closeDialog, openDialog],
  );

  return {
    closeDialog,
    openDialog,
    toggleDialog,
  };
};
