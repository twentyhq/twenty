import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFilterAPIPersist } from '@/views/hooks/internal/usePerformViewFilterAPIPersist';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordTableWidgetFiltersToView = (
  viewId: string,
  instanceId: string,
) => {
  const {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
  } = usePerformViewFilterAPIPersist();

  const {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDestroy,
  } = usePerformViewFilterGroupAPIPersist();

  const currentRecordFiltersCallbackState = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentRecordFilterGroupsCallbackState =
    useAtomComponentStateCallbackState(
      currentRecordFilterGroupsComponentState,
      instanceId,
    );

  const store = useStore();

  const saveRecordTableWidgetFiltersToView = useCallback(async () => {
    const views = store.get(viewsSelector.atom);
    const currentView = views.find((view) => view.id === viewId);

    if (!isDefined(currentView)) {
      return;
    }

    const currentRecordFilters = store.get(currentRecordFiltersCallbackState);
    const currentRecordFilterGroups = store.get(
      currentRecordFilterGroupsCallbackState,
    );

    const newViewFilterGroups = currentRecordFilterGroups.map(
      (recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view: currentView,
        }),
    );

    const currentViewFilterGroups = currentView.viewFilterGroups ?? [];

    const viewFilterGroupsToCreate = getViewFilterGroupsToCreate(
      currentViewFilterGroups,
      newViewFilterGroups,
    );
    const viewFilterGroupsToUpdate = getViewFilterGroupsToUpdate(
      currentViewFilterGroups,
      newViewFilterGroups,
    );
    const viewFilterGroupsToDelete = getViewFilterGroupsToDelete(
      currentViewFilterGroups,
      newViewFilterGroups,
    );

    await performViewFilterGroupAPICreate(
      viewFilterGroupsToCreate,
      currentView,
    );
    await performViewFilterGroupAPIUpdate(viewFilterGroupsToUpdate);

    const newViewFilters = currentRecordFilters.map(
      mapRecordFilterToViewFilter,
    );

    const currentViewFilters = currentView.viewFilters ?? [];

    const viewFiltersToCreate = getViewFiltersToCreate(
      currentViewFilters,
      newViewFilters,
    );
    const viewFiltersToUpdate = getViewFiltersToUpdate(
      currentViewFilters,
      newViewFilters,
    );
    const viewFiltersToDelete = getViewFiltersToDelete(
      currentViewFilters,
      newViewFilters,
    );

    await performViewFilterAPIDelete(
      viewFiltersToDelete.map((viewFilter) => ({
        input: { id: viewFilter.id },
      })),
    );

    await performViewFilterAPIUpdate(
      viewFiltersToUpdate.map((viewFilter) => ({
        input: {
          id: viewFilter.id,
          update: {
            value: viewFilter.value,
            operand: viewFilter.operand,
            positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
            viewFilterGroupId: viewFilter.viewFilterGroupId,
            subFieldName: viewFilter.subFieldName ?? null,
          },
        },
      })),
    );

    await performViewFilterAPICreate(
      viewFiltersToCreate.map((viewFilter) => ({
        input: {
          id: viewFilter.id,
          fieldMetadataId: viewFilter.fieldMetadataId,
          viewId: currentView.id,
          value: viewFilter.value,
          operand: viewFilter.operand,
          viewFilterGroupId: viewFilter.viewFilterGroupId,
          positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
          subFieldName: viewFilter.subFieldName ?? null,
        },
      })),
    );

    await performViewFilterGroupAPIDestroy(
      viewFilterGroupsToDelete.map((viewFilterGroup) => viewFilterGroup.id),
    );
  }, [
    store,
    viewId,
    currentRecordFiltersCallbackState,
    currentRecordFilterGroupsCallbackState,
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDestroy,
  ]);

  return { saveRecordTableWidgetFiltersToView };
};
