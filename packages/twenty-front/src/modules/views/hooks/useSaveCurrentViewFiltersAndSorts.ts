import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilCallbackState';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFiltersAndSorts = (
  viewBarComponentId?: string,
) => {
  const { getViewFromCache } = useGetViewFromCache();

  const {
    unsavedToDeleteViewSortIdsState,
    unsavedToUpsertViewSortsState,
    unsavedToDeleteViewFilterIdsState,
    unsavedToUpsertViewFiltersState,
  } = useViewStates(viewBarComponentId);

  const currentViewIdCallbackState = useRecoilCallbackState(
    currentViewIdComponentState,
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

  const { resetCurrentView } = useResetCurrentView(viewBarComponentId);

  const saveViewSorts = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsState,
        );

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsState,
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
      unsavedToDeleteViewSortIdsState,
      unsavedToUpsertViewSortsState,
      updateViewSortRecords,
    ],
  );

  const saveViewFilters = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId: string) => {
        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsState,
        );

        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersState,
        );

        const view = await getViewFromCache(viewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const viewFiltersToCreate = unsavedToUpsertViewFilters.filter(
          (viewFilter) =>
            !view.viewFilters.some(
              (vf) => vf.fieldMetadataId === viewFilter.fieldMetadataId,
            ),
        );

        const viewFiltersToUpdate = unsavedToUpsertViewFilters.filter(
          (viewFilter) =>
            view.viewFilters.some(
              (vf) => vf.fieldMetadataId === viewFilter.fieldMetadataId,
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
      unsavedToDeleteViewFilterIdsState,
      unsavedToUpsertViewFiltersState,
      updateViewFilterRecords,
    ],
  );

  const saveCurrentViewFilterAndSorts = useRecoilCallback(
    ({ snapshot }) =>
      async (viewId?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!isDefined(currentViewId)) {
          return;
        }

        await saveViewFilters(viewId ?? currentViewId);
        await saveViewSorts(viewId ?? currentViewId);
        resetCurrentView();
      },
    [
      currentViewIdCallbackState,
      resetCurrentView,
      saveViewFilters,
      saveViewSorts,
    ],
  );

  return {
    saveCurrentViewFilterAndSorts,
  };
};
