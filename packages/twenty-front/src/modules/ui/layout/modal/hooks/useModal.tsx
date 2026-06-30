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
    (modalInstanceId: string) => {
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: modalInstanceId,
        }),
      );

      if (!isModalOpen) {
        return;
      }

      removeFocusItemFromFocusStackById({
        focusId: modalInstanceId,
      });

      store.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: modalInstanceId,
        }),
        false,
      );
    },
    [store, removeFocusItemFromFocusStackById],
  );

  const openModal = useCallback(
    (modalInstanceId: string) => {
      const isModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: modalInstanceId,
        }),
      );

      if (isModalOpened) {
        return;
      }

      store.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: modalInstanceId,
        }),
        true,
      );

      pushFocusItemToFocusStack({
        focusId: modalInstanceId,
        component: {
          type: FocusComponentType.MODAL,
          instanceId: modalInstanceId,
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
    (modalInstanceId: string) => {
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: modalInstanceId,
        }),
      );

      if (isModalOpen) {
        closeModal(modalInstanceId);
      } else {
        openModal(modalInstanceId);
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
