import { useRecoilCallback } from 'recoil';

import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDefined } from 'twenty-shared/utils';

export const useModal = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope('modal');

  const closeModal = useRecoilCallback(
    ({ set, snapshot }) =>
      (modalId: string) => {
        const isModalOpen = snapshot
          .getLoadable(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          )
          .getValue();

        if (isModalOpen) {
          goBackToPreviousHotkeyScope();
          set(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
            false,
          );
        }
      },
    [goBackToPreviousHotkeyScope],
  );

  const openModal = useRecoilCallback(
    ({ set }) =>
      (modalId: string, customHotkeyScope?: HotkeyScope) => {
        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          true,
        );

        if (isDefined(customHotkeyScope)) {
          setHotkeyScopeAndMemorizePreviousScope(
            customHotkeyScope.scope,
            customHotkeyScope.customScopes,
          );
        } else {
          setHotkeyScopeAndMemorizePreviousScope(ModalHotkeyScope.ModalFocus, {
            goto: false,
            commandMenu: false,
            commandMenuOpen: false,
            keyboardShortcutMenu: false,
          });
        }
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const toggleModal = useRecoilCallback(
    ({ snapshot }) =>
      (modalId: string, customHotkeyScope?: HotkeyScope) => {
        const isModalOpen = snapshot
          .getLoadable(
            isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          )
          .getValue();

        if (isModalOpen) {
          closeModal(modalId);
        } else {
          openModal(modalId, customHotkeyScope);
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
