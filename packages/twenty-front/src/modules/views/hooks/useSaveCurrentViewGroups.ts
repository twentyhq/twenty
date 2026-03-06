import { useStore } from 'jotai';
import { useCallback } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewGroupAPIPersist } from '@/views/hooks/internal/usePerformViewGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewGroups = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewGroupAPIUpdate } = usePerformViewGroupAPIPersist();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const store = useStore();

  const saveViewGroup = useCallback(
    async (viewGroupToSave: ViewGroup) => {
      if (!canPersistChanges) {
        return;
      }

      const currentViewId = store.get(currentViewIdCallbackState);

      if (!currentViewId) {
        return;
      }

      const view = getViewFromPrefetchState(currentViewId);

      if (isUndefinedOrNull(view)) {
        return;
      }

      const currentViewGroups = view.viewGroups;

      const existingField = currentViewGroups.find(
        (currentViewGroup) =>
          currentViewGroup.fieldValue === viewGroupToSave.fieldValue,
      );

      if (isUndefinedOrNull(existingField)) {
        return;
      }

      if (
        isDeeplyEqual(
          {
            position: existingField.position,
            isVisible: existingField.isVisible,
          },
          {
            position: viewGroupToSave.position,
            isVisible: viewGroupToSave.isVisible,
          },
        )
      ) {
        return;
      }

      await performViewGroupAPIUpdate([
        {
          input: {
            id: existingField.id,
            update: {
              isVisible: viewGroupToSave.isVisible,
              position: viewGroupToSave.position,
              fieldValue: viewGroupToSave.fieldValue,
            },
          },
        },
      ]);
    },
    [
      store,
      canPersistChanges,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      performViewGroupAPIUpdate,
    ],
  );

  const saveViewGroups = useCallback(
    async (viewGroupsToSave: ViewGroup[]) => {
      if (!canPersistChanges) {
        return;
      }

      const currentViewId = store.get(currentViewIdCallbackState);

      if (!currentViewId) {
        return;
      }

      const view = getViewFromPrefetchState(currentViewId);

      if (isUndefinedOrNull(view)) {
        return;
      }

      const currentViewGroups = view.viewGroups;

      const viewGroupsToUpdate = viewGroupsToSave
        .map((viewGroupToSave) => {
          const existingField = currentViewGroups.find(
            (currentViewGroup) =>
              currentViewGroup.fieldValue === viewGroupToSave.fieldValue,
          );

          if (isUndefinedOrNull(existingField)) {
            return undefined;
          }

          if (
            isDeeplyEqual(
              {
                position: existingField.position,
                isVisible: existingField.isVisible,
              },
              {
                position: viewGroupToSave.position,
                isVisible: viewGroupToSave.isVisible,
              },
            )
          ) {
            return undefined;
          }

          return {
            input: {
              id: existingField.id,
              update: {
                isVisible: viewGroupToSave.isVisible,
                position: viewGroupToSave.position,
                fieldValue: viewGroupToSave.fieldValue,
              },
            },
          };
        })
        .filter(isDefined);

      if (!isDefined(view.mainGroupByFieldMetadataId)) {
        throw new Error('mainGroupByFieldMetadataId is required');
      }

      await performViewGroupAPIUpdate(viewGroupsToUpdate);
    },
    [
      store,
      canPersistChanges,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      performViewGroupAPIUpdate,
    ],
  );

  return {
    saveViewGroup,
    saveViewGroups,
  };
};
