import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceIdResolver } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useModal = () => {
  const surfaceId = useComponentStateSurfaceId();
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
          surfaceId,
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
          surfaceId,
        }),
        false,
      );
    },
    [
      store,
      removeFocusItemFromFocusStackById,
      resolveComponentInstanceId,
      surfaceId,
    ],
  );

  const openModal = useCallback(
    (modalInstanceId: string) => {
      const scopedModalInstanceId = resolveComponentInstanceId(modalInstanceId);
      const isModalOpened = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
          surfaceId,
        }),
      );

      if (isModalOpened) {
        return;
      }

      store.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
          surfaceId,
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
    [store, pushFocusItemToFocusStack, resolveComponentInstanceId, surfaceId],
  );

  const toggleModal = useCallback(
    (modalInstanceId: string) => {
      const scopedModalInstanceId = resolveComponentInstanceId(modalInstanceId);
      const isModalOpen = store.get(
        isModalOpenedComponentState.atomFamily({
          instanceId: scopedModalInstanceId,
          surfaceId,
        }),
      );

      if (isModalOpen) {
        closeModal(modalInstanceId);
      } else {
        openModal(modalInstanceId);
      }
    },
    [store, closeModal, openModal, resolveComponentInstanceId, surfaceId],
  );

  return {
    closeModal,
    openModal,
    toggleModal,
  };
};
