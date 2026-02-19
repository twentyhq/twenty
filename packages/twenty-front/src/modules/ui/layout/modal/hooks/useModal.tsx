import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useModal = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const closeModal = useCallback(
    (modalId: string) => {
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
      );

      if (!isModalOpen) {
        return;
      }

      removeFocusItemFromFocusStackById({
        focusId: modalId,
      });

      store.set(
        isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        false,
      );
    },
    [store, removeFocusItemFromFocusStackById],
  );

  const openModal = useCallback(
    (modalId: string) => {
      const isModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
      );

      if (isModalOpened) {
        return;
      }

      store.set(
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
    [store, pushFocusItemToFocusStack],
  );

  const toggleModal = useCallback(
    (modalId: string) => {
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
      );

      if (isModalOpen) {
        closeModal(modalId);
      } else {
        openModal(modalId);
      }
    },
    [store, closeModal, openModal],
  );

  return {
    closeModal,
    openModal,
    toggleModal,
  };
};
