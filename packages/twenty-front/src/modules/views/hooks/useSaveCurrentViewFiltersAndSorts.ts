import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
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
    currentViewIdState,
  } = useViewStates(viewBarComponentId);

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
              (vf) => vf.fieldMetadataId === viewSort.fieldMetadataId,
            ),
        );

        const viewSortsToUpdate = unsavedToUpsertViewSorts.filter((viewSort) =>
          view.viewSorts.some((vf) => vf.id === viewSort.id),
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
            !view.viewFilters.some((vf) => vf.id === viewFilter.id),
        );

        const viewFiltersToUpdate = unsavedToUpsertViewFilters.filter(
          (viewFilter) =>
            view.viewFilters.some((vf) => vf.id === viewFilter.id),
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
          .getLoadable(currentViewIdState)
          .getValue();

        if (!isDefined(currentViewId)) {
          return;
        }

        await saveViewFilters(viewId ?? currentViewId);
        await saveViewSorts(viewId ?? currentViewId);
        resetCurrentView();
      },
    [currentViewIdState, resetCurrentView, saveViewFilters, saveViewSorts],
  );

  return {
    saveCurrentViewFilterAndSorts,
  };
};
