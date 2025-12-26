import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroup';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewGroups = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { updateViewGroups } = usePersistViewGroupRecords();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const saveViewGroup = useRecoilCallback(
    ({ snapshot }) =>
      async (viewGroupToSave: ViewGroup) => {
        if (!canPersistChanges) {
          return;
        }

        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

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

        await updateViewGroups([
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
      canPersistChanges,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewGroups,
    ],
  );

  const saveViewGroups = useRecoilCallback(
    ({ snapshot }) =>
      async (viewGroupsToSave: ViewGroup[]) => {
        if (!canPersistChanges) {
          return;
        }

        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

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

        await updateViewGroups(viewGroupsToUpdate);
      },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewGroups,
    ],
  );

  return {
    saveViewGroup,
    saveViewGroups,
  };
};
