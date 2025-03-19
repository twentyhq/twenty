import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { ViewGroup } from '@/views/types/ViewGroup';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { isDefined } from 'twenty-shared/utils';

export const useSaveCurrentViewGroups = () => {
  const { createViewGroupRecords, updateViewGroupRecords } =
    usePersistViewGroupRecords();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
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

        await updateViewGroupRecords([
          { ...viewGroupToSave, id: existingField.id },
        ]);
      },
    [
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewGroupRecords,
    ],
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

        const view = await getViewFromPrefetchState(currentViewId);

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
          createViewGroupRecords({ viewGroupsToCreate, viewId: view.id }),
          updateViewGroupRecords(viewGroupsToUpdate),
        ]);
      },
    [
      createViewGroupRecords,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewGroupRecords,
    ],
  );

  return {
    saveViewGroup,
    saveViewGroups,
  };
};
