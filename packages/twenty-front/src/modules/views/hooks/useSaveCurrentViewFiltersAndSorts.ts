import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsFamilyState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';
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
      unsavedToDeleteViewSortIdsComponentState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewSortsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewSortsComponentState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentState,
      viewBarComponentId,
    );

  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFiltersComponentState,
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
