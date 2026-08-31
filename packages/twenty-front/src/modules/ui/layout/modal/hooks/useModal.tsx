import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceIdResolver } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceIdResolver';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useModal = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();
  const resolveComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceIdResolver();

  const closeModal = useCallback(
    (modalInstanceId: string) => {
      const scopedModalInstanceId = resolveComponentInstanceId(modalInstanceId);
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
        }),
      );

      if (!isModalOpen) {
        return;
      }

      removeFocusItemFromFocusStackById({
        focusId: scopedModalInstanceId,
      });

      store.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
        }),
        false,
      );
    },
    [store, removeFocusItemFromFocusStackById, resolveComponentInstanceId],
  );

  const openModal = useCallback(
    (modalInstanceId: string) => {
      const scopedModalInstanceId = resolveComponentInstanceId(modalInstanceId);
      const isModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
        }),
      );

      if (isModalOpened) {
        return;
      }

      store.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
        }),
        true,
      );

      pushFocusItemToFocusStack({
        focusId: scopedModalInstanceId,
        component: {
          type: FocusComponentType.MODAL,
          instanceId: scopedModalInstanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: false,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [store, pushFocusItemToFocusStack, resolveComponentInstanceId],
  );

  const toggleModal = useCallback(
    (modalInstanceId: string) => {
      const scopedModalInstanceId = resolveComponentInstanceId(modalInstanceId);
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
        }),
      );

      if (isModalOpen) {
        closeModal(modalInstanceId);
      } else {
        openModal(modalInstanceId);
      }
    },
    [store, closeModal, openModal, resolveComponentInstanceId],
  );

  return {
    closeModal,
    openModal,
    toggleModal,
  };
};
