import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { useSaveRecordFiltersToViewFilters } from '@/views/hooks/useSaveRecordFiltersToViewFilters';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
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

  const unsavedToDeleteViewSortIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewSortIdsComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewSortsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewSortsComponentFamilyState,
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
    createViewSortRecords,
    updateViewSortRecords,
    deleteViewSortRecords,
  } = usePersistViewSortRecords();

  const {
    createViewFilterGroupRecords,
    deleteViewFilterGroupRecords,
    updateViewFilterGroupRecords,
  } = usePersistViewFilterGroupRecords();

  const { resetUnsavedViewStates } =
    useResetUnsavedViewStates(viewBarComponentId);

  const saveViewSorts = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState({ viewId }),
        );

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState({ viewId }),
        );

        const view = await getViewFromPrefetchState(viewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const viewSortsToCreate = unsavedToUpsertViewSorts.filter(
          (viewSort) =>
            !view.viewSorts.some(
              (vs) => vs.fieldMetadataId === viewSort.fieldMetadataId,
            ),
        );

        const viewSortsToUpdate = unsavedToUpsertViewSorts.filter((viewSort) =>
          view.viewSorts.some(
            (vs) => vs.fieldMetadataId === viewSort.fieldMetadataId,
          ),
        );

        await createViewSortRecords(viewSortsToCreate, view);
        await updateViewSortRecords(viewSortsToUpdate);
        await deleteViewSortRecords(unsavedToDeleteViewSortIds);
      },
    [
      createViewSortRecords,
      deleteViewSortRecords,
      getViewFromPrefetchState,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
      updateViewSortRecords,
    ],
  );

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
        await saveViewSorts(viewId);

        await saveRecordFiltersToViewFilters();

        resetUnsavedViewStates(viewId);
      },
    [
      currentViewIdCallbackState,
      resetUnsavedViewStates,
      saveViewSorts,
      saveViewFilterGroups,
      saveRecordFiltersToViewFilters,
    ],
  );

  return {
    saveCurrentViewFilterAndSorts,
  };
};
