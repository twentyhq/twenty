import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useModal = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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

        removeFocusItemFromFocusStackById({
          focusId: modalId,
        });

        set(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
          false,
        );
      },
    [removeFocusItemFromFocusStackById],
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
