import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFiltersAndSorts = (
  viewBarComponentId?: string,
) => {
  const { getViewFromCache } = useGetViewFromCache();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
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

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFiltersComponentFamilyState,
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
    createViewFilterRecords,
    updateViewFilterRecords,
    deleteViewFilterRecords,
  } = usePersistViewFilterRecords();

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

        const view = await getViewFromCache(viewId);

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
      getViewFromCache,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
      updateViewSortRecords,
    ],
  );

  const saveViewFilters = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsCallbackState({ viewId }),
        );

        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState({ viewId }),
        );

        const view = await getViewFromCache(viewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const viewFiltersToCreate = unsavedToUpsertViewFilters.filter(
          (viewFilter) =>
            !view.viewFilters.some(
              (viewFilterToFilter) => viewFilterToFilter.id === viewFilter.id,
            ),
        );

        const viewFiltersToUpdate = unsavedToUpsertViewFilters.filter(
          (viewFilter) =>
            view.viewFilters.some(
              (viewFilterToFilter) => viewFilterToFilter.id === viewFilter.id,
            ),
        );

        await createViewFilterRecords(viewFiltersToCreate, view);
        await updateViewFilterRecords(viewFiltersToUpdate);
        await deleteViewFilterRecords(unsavedToDeleteViewFilterIds);
      },
    [
      createViewFilterRecords,
      deleteViewFilterRecords,
      getViewFromCache,
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
      updateViewFilterRecords,
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

        const view = await getViewFromCache(viewId);

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
      getViewFromCache,
      createViewFilterGroupRecords,
      deleteViewFilterGroupRecords,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
      updateViewFilterGroupRecords,
    ],
  );

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
        await saveViewFilters(viewId);
        await saveViewSorts(viewId);

        resetUnsavedViewStates(viewId);
      },
    [
      currentViewIdCallbackState,
      resetUnsavedViewStates,
      saveViewFilters,
      saveViewSorts,
      saveViewFilterGroups,
    ],
  );

  return {
    saveCurrentViewFilterAndSorts,
  };
};
