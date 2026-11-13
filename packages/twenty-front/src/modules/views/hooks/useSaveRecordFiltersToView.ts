import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { usePerformViewFilterApiPersist } from '@/views/hooks/internal/usePerformViewFilterApiPersist';
import { usePerformViewFilterGroupApiPersist } from '@/views/hooks/internal/usePerformViewFilterGroupApiPersist';
import { type View } from '@/views/types/View';
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

export const useSaveRecordFiltersToView = () => {
  const store = useStore();

  const {
    performViewFilterGroupApiCreate,
    performViewFilterGroupApiUpdate,
    performViewFilterGroupApiDestroy,
  } = usePerformViewFilterGroupApiPersist();

  const {
    performViewFilterApiCreate,
    performViewFilterApiUpdate,
    performViewFilterApiDestroy,
  } = usePerformViewFilterApiPersist();

  const saveRecordFiltersToView = useCallback(
    async ({
      view,
      recordFilters,
      recordFilterGroups,
    }: {
      view: View;
      recordFilters: RecordFilter[];
      recordFilterGroups: RecordFilterGroup[];
    }) => {
      const currentViewFilterGroups = view.viewFilterGroups ?? [];

      const newViewFilterGroups = recordFilterGroups.map((recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view,
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

      const createFilterGroupResult = await performViewFilterGroupApiCreate(
        viewFilterGroupsToCreate,
        view,
      );
      if (createFilterGroupResult.status === 'failed') {
        return;
      }

      const updateFilterGroupResult = await performViewFilterGroupApiUpdate(
        viewFilterGroupsToUpdate,
      );
      if (updateFilterGroupResult.status === 'failed') {
        return;
      }

      const currentViewFilters = view.viewFilters ?? [];

      const newViewFilters = recordFilters.map(mapRecordFilterToViewFilter);

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

      const createViewFilterInputs = viewFiltersToCreate.map((viewFilter) => ({
        input: {
          id: viewFilter.id,
          fieldMetadataId: viewFilter.fieldMetadataId,
          viewId: view.id,
          value: viewFilter.value,
          operand: viewFilter.operand,
          viewFilterGroupId: viewFilter.viewFilterGroupId,
          positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
          subFieldName: viewFilter.subFieldName ?? null,
          relationTargetFieldMetadataId:
            viewFilter.relationTargetFieldMetadataId ?? null,
        },
      }));

      const updateViewFilterInputs = viewFiltersToUpdate.map((viewFilter) => ({
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
      }));

      const destroyViewFilterInputs = viewFiltersToDelete.map((viewFilter) => ({
        input: {
          id: viewFilter.id,
        },
      }));

      const createResult = await performViewFilterApiCreate(
        createViewFilterInputs,
      );
      if (createResult.status === 'failed') {
        return;
      }

      const updateResult = await performViewFilterApiUpdate(
        updateViewFilterInputs,
      );
      if (updateResult.status === 'failed') {
        return;
      }

      const deleteResult = await performViewFilterApiDestroy(
        destroyViewFilterInputs,
      );
      if (deleteResult.status === 'failed') {
        return;
      }

      const destroyFilterGroupResult = await performViewFilterGroupApiDestroy(
        viewFilterGroupIdsToDestroy,
      );
      if (destroyFilterGroupResult.status === 'failed') {
        return;
      }

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
    },
    [
      store,
      performViewFilterGroupApiCreate,
      performViewFilterGroupApiUpdate,
      performViewFilterGroupApiDestroy,
      performViewFilterApiCreate,
      performViewFilterApiUpdate,
      performViewFilterApiDestroy,
    ],
  );

  return { saveRecordFiltersToView };
};
