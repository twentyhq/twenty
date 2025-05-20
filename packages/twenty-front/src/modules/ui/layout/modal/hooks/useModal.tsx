import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useFocusStack } from '@/ui/utilities/focus/hooks/useFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useModal = () => {
  const { pushFocusIdentifier, removeFocusId } = useFocusStack();

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

        removeFocusId({
          focusId: modalId,
          memoizeKey: modalId,
        });

        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          false,
        );
      },
    [removeFocusId],
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

        pushFocusIdentifier({
          focusId: modalId,
          component: {
            type: FocusComponentType.MODAL,
            instanceId: modalId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysWithModifiers: false,
            enableConflictingWithKeyboardGlobalHotkeys: false,
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
    [pushFocusIdentifier],
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
