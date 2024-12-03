import { useRecoilCallback } from 'recoil';

import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { ViewGroup } from '@/views/types/ViewGroup';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewGroups = (viewBarComponentId?: string) => {
  const { createViewGroupRecords, updateViewGroupRecords } =
    usePersistViewGroupRecords();

  const { getViewFromCache } = useGetViewFromCache();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const saveViewGroup = useRecoilCallback(
    ({ snapshot }) =>
      async (viewGroupToSave: ViewGroup) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = await getViewFromCache(currentViewId);

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

        await updateViewGroupRecords([
          { ...viewGroupToSave, id: existingField.id },
        ]);
      },
    [currentViewIdCallbackState, getViewFromCache, updateViewGroupRecords],
  );

  const saveViewGroups = useRecoilCallback(
    ({ snapshot }) =>
      async (viewGroupsToSave: ViewGroup[]) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = await getViewFromCache(currentViewId);

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

            return { ...viewGroupToSave, id: existingField.id };
          })
          .filter(isDefined);

        const viewGroupsToCreate = viewGroupsToSave.filter(
          (viewFieldToSave) =>
            !currentViewGroups.some(
              (currentViewGroup) =>
                currentViewGroup.fieldValue === viewFieldToSave.fieldValue,
            ),
        );

        await Promise.all([
          createViewGroupRecords(viewGroupsToCreate, view),
          updateViewGroupRecords(viewGroupsToUpdate),
        ]);
      },
    [
      createViewGroupRecords,
      currentViewIdCallbackState,
      getViewFromCache,
      updateViewGroupRecords,
    ],
  );

  return {
    saveViewGroup,
    saveViewGroups,
  };
};
