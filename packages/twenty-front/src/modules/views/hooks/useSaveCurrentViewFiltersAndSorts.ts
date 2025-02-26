import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { useSaveRecordFiltersToViewFilters } from '@/views/hooks/useSaveRecordFiltersToViewFilters';
import { useSaveRecordSortsToViewSorts } from '@/views/hooks/useSaveRecordSortsToViewSorts';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { isDefined } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFiltersAndSorts = (
  viewBarComponentId?: string,
) => {
  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterGroupIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
      viewBarComponentId,
    );

  const {
    createViewFilterGroupRecords,
    deleteViewFilterGroupRecords,
    updateViewFilterGroupRecords,
  } = usePersistViewFilterGroupRecords();

  const { resetUnsavedViewStates } =
    useResetUnsavedViewStates(viewBarComponentId);

  const saveViewFilterGroups = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const unsavedToDeleteViewFilterGroupIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterGroupIdsCallbackState({ viewId }),
        );

        const unsavedToUpsertViewFilterGroups = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFilterGroupsCallbackState({ viewId }),
        );

        const view = await getViewFromPrefetchState(viewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const viewFilterGroupsToCreate = unsavedToUpsertViewFilterGroups.filter(
          (viewFilterGroup) =>
            !view.viewFilterGroups?.some(
              (viewFilterGroupToFilter) =>
                viewFilterGroupToFilter.id === viewFilterGroup.id,
            ),
        );

        const viewFilterGroupsToUpdate = unsavedToUpsertViewFilterGroups.filter(
          (viewFilterGroup) =>
            view.viewFilterGroups?.some(
              (viewFilterGroupToFilter) =>
                viewFilterGroupToFilter.id === viewFilterGroup.id,
            ),
        );

        await createViewFilterGroupRecords(viewFilterGroupsToCreate, view);
        await updateViewFilterGroupRecords(viewFilterGroupsToUpdate);
        await deleteViewFilterGroupRecords(unsavedToDeleteViewFilterGroupIds);
      },
    [
      getViewFromPrefetchState,
      createViewFilterGroupRecords,
      deleteViewFilterGroupRecords,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
      updateViewFilterGroupRecords,
    ],
  );

  const { saveRecordFiltersToViewFilters } =
    useSaveRecordFiltersToViewFilters();

  const { saveRecordSortsToViewSorts } = useSaveRecordSortsToViewSorts();

  const saveCurrentViewFilterAndSorts = useRecoilCallback(
    ({ snapshot }) =>
      async (viewIdFromProps?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!isDefined(currentViewId)) {
          return;
        }

        const viewId = viewIdFromProps ?? currentViewId;

        await saveViewFilterGroups(viewId);

        await saveRecordSortsToViewSorts();
        await saveRecordFiltersToViewFilters();

        resetUnsavedViewStates(viewId);
      },
    [
      currentViewIdCallbackState,
      resetUnsavedViewStates,
      saveViewFilterGroups,
      saveRecordFiltersToViewFilters,
      saveRecordSortsToViewSorts,
    ],
  );

  return {
    saveCurrentViewFilterAndSorts,
  };
};
