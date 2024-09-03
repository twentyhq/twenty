import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilInstanceCallbackState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceCallbackState';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { currentViewIdInstanceState } from '@/views/states/currentViewIdInstanceState';
import { unsavedToDeleteViewFilterIdsInstanceState } from '@/views/states/unsavedToDeleteViewFilterIdsInstanceState';
import { unsavedToDeleteViewSortIdsInstanceState } from '@/views/states/unsavedToDeleteViewSortIdsInstanceState';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';
import { unsavedToUpsertViewSortsInstanceState } from '@/views/states/unsavedToUpsertViewSortsInstanceState';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFiltersAndSorts = (
  viewBarComponentId?: string,
) => {
  const { getViewFromCache } = useGetViewFromCache();

  const currentViewIdCallbackState = useRecoilInstanceCallbackState(
    currentViewIdInstanceState,
    viewBarComponentId,
  );

  const unsavedToDeleteViewSortIdsCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToDeleteViewSortIdsInstanceState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewSortsCallbackState = useRecoilInstanceCallbackState(
    unsavedToUpsertViewSortsInstanceState,
    viewBarComponentId,
  );

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToDeleteViewFilterIdsInstanceState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToUpsertViewFiltersInstanceState,
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
          unsavedToDeleteViewSortIdsCallbackState,
        );

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState,
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
          unsavedToDeleteViewFilterIdsCallbackState,
        );

        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState,
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
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
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
