import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useModal = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStack } = useRemoveFocusItemFromFocusStack();

  const closeModal = useRecoilCallback(
    ({ set, snapshot }) =>
      (modalId: string) => {
        const isModalOpen = snapshot
          .getLoadable(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          )
          .getValue();

        if (!isModalOpen) {
          return;
        }

        removeFocusItemFromFocusStack({
          focusId: modalId,
          memoizeKey: modalId,
        });

        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          false,
        );
      },
    [removeFocusItemFromFocusStack],
  );

  const openModal = useRecoilCallback(
    ({ set, snapshot }) =>
      (modalId: string) => {
        const isModalOpened = snapshot
          .getLoadable(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          )
          .getValue();

        if (isModalOpened) {
          return;
        }

        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          true,
        );

        pushFocusItemToFocusStack({
          focusId: modalId,
          component: {
            type: FocusComponentType.MODAL,
            instanceId: modalId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysWithModifiers: false,
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
          // TODO: Remove this once we've migrated hotkey scopes to the new api
          hotkeyScope: {
            scope: ModalHotkeyScope.ModalFocus,
            customScopes: {
              goto: false,
              commandMenu: false,
              commandMenuOpen: false,
              keyboardShortcutMenu: false,
            },
          },
          memoizeKey: modalId,
        });
      },
    [pushFocusItemToFocusStack],
  );

  const toggleModal = useRecoilCallback(
    ({ snapshot }) =>
      (modalId: string) => {
        const isModalOpen = snapshot
          .getLoadable(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          )
          .getValue();

        if (isModalOpen) {
          closeModal(modalId);
        } else {
          openModal(modalId);
        }
      },
    [closeModal, openModal],
  );

  return {
    closeModal,
    openModal,
    toggleModal,
  };
};
