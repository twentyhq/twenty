import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFilterAPIPersist } from '@/views/hooks/internal/usePerformViewFilterAPIPersist';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
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

export const useSaveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters =
  () => {
    const { canPersistChanges } = useCanPersistViewChanges();
    const { currentView } = useGetCurrentViewOnly();

    const store = useStore();

    const {
      performViewFilterGroupAPICreate,
      performViewFilterGroupAPIUpdate,
      performViewFilterGroupAPIDestroy,
    } = usePerformViewFilterGroupAPIPersist();

    const {
      performViewFilterAPICreate,
      performViewFilterAPIUpdate,
      performViewFilterAPIDestroy,
    } = usePerformViewFilterAPIPersist();

    const currentRecordFilterGroupsCallbackState =
      useAtomComponentStateCallbackState(
        currentRecordFilterGroupsComponentState,
      );

    const currentRecordFiltersCallbackState =
      useAtomComponentStateCallbackState(currentRecordFiltersComponentState);

    const saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters =
      useCallback(async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
          return;
        }

        const currentViewFilterGroups = currentView.viewFilterGroups ?? [];
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

        const viewFilterGroupsToCreate = getViewFilterGroupsToCreate(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupsToDelete = getViewFilterGroupsToDelete(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupsToUpdate = getViewFilterGroupsToUpdate(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupIdsToDestroy = viewFilterGroupsToDelete.map(
          (viewFilterGroup) => viewFilterGroup.id,
        );

        await performViewFilterGroupAPICreate(
          viewFilterGroupsToCreate,
          currentView,
        );
        await performViewFilterGroupAPIUpdate(viewFilterGroupsToUpdate);
        await performViewFilterGroupAPIDestroy(viewFilterGroupIdsToDestroy);

        // Mirror the DB cascade: remove cascade-deleted viewFilters from the store
        if (viewFilterGroupIdsToDestroy.length > 0) {
          const destroyedIdsSet = new Set(viewFilterGroupIdsToDestroy);

          store.set(metadataStoreState.atomFamily('viewFilters'), (prev) => ({
            ...prev,
            current: (prev.current as FlatViewFilter[]).filter(
              (viewFilter) =>
                !isDefined(viewFilter.viewFilterGroupId) ||
                !destroyedIdsSet.has(viewFilter.viewFilterGroupId),
            ),
          }));
        }

        const currentViewFilters = currentView.viewFilters ?? [];
        const currentRecordFilters = store.get(
          currentRecordFiltersCallbackState,
        );

        const newViewFilters = currentRecordFilters.map(
          mapRecordFilterToViewFilter,
        );

        const viewFiltersToCreate = getViewFiltersToCreate(
          currentViewFilters,
          newViewFilters,
        );

        const viewFiltersToDelete = getViewFiltersToDelete(
          currentViewFilters,
          newViewFilters,
        ).filter(
          (viewFilter) =>
            !isDefined(viewFilter.viewFilterGroupId) ||
            !viewFilterGroupIdsToDestroy.includes(viewFilter.viewFilterGroupId),
        );

        const viewFiltersToUpdate = getViewFiltersToUpdate(
          currentViewFilters,
          newViewFilters,
        );

        const createViewFilterInputs = viewFiltersToCreate.map(
          (viewFilter) => ({
            input: {
              id: viewFilter.id,
              fieldMetadataId: viewFilter.fieldMetadataId,
              viewId: currentView.id,
              value: viewFilter.value,
              operand: viewFilter.operand,
              viewFilterGroupId: viewFilter.viewFilterGroupId,
              positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
              subFieldName: viewFilter.subFieldName ?? null,
              relationTargetFieldMetadataId:
                viewFilter.relationTargetFieldMetadataId ?? null,
            },
          }),
        );

        const updateViewFilterInputs = viewFiltersToUpdate.map(
          (viewFilter) => ({
            input: {
              id: viewFilter.id,
              update: {
                value: viewFilter.value,
                operand: viewFilter.operand,
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                subFieldName: viewFilter.subFieldName ?? null,
                relationTargetFieldMetadataId:
                  viewFilter.relationTargetFieldMetadataId ?? null,
              },
            },
          }),
        );

        const destroyViewFilterInputs = viewFiltersToDelete.map(
          (viewFilter) => ({
            input: {
              id: viewFilter.id,
            },
          }),
        );

        const createResult = await performViewFilterAPICreate(
          createViewFilterInputs,
        );
        if (createResult.status === 'failed') {
          return;
        }

        const updateResult = await performViewFilterAPIUpdate(
          updateViewFilterInputs,
        );
        if (updateResult.status === 'failed') {
          return;
        }

        const deleteResult = await performViewFilterAPIDestroy(
          destroyViewFilterInputs,
        );
        if (deleteResult.status === 'failed') {
          return;
        }
      }, [
        canPersistChanges,
        currentView,
        store,
        currentRecordFilterGroupsCallbackState,
        currentRecordFiltersCallbackState,
        performViewFilterGroupAPICreate,
        performViewFilterGroupAPIUpdate,
        performViewFilterGroupAPIDestroy,
        performViewFilterAPICreate,
        performViewFilterAPIUpdate,
        performViewFilterAPIDestroy,
      ]);

    return {
      saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters,
    };
  };
