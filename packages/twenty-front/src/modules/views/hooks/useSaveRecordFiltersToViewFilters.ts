import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFilterAPIPersist } from '@/views/hooks/internal/usePerformViewFilterAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordFiltersToViewFilters = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
  } = usePerformViewFilterAPIPersist();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFiltersCallbackState = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const store = useStore();

  const saveRecordFiltersToViewFilters = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    const currentViewFilters = currentView?.viewFilters ?? [];

    const currentRecordFilters = store.get(currentRecordFiltersCallbackState);

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
    );

    const viewFiltersToUpdate = getViewFiltersToUpdate(
      currentViewFilters,
      newViewFilters,
    );

    const createViewFilterInputs = viewFiltersToCreate.map((viewFilter) => ({
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
        },
      },
    }));

    const deleteViewFilterInputs = viewFiltersToDelete.map((viewFilter) => ({
      input: {
        id: viewFilter.id,
      },
    }));

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

    const deleteResult = await performViewFilterAPIDelete(
      deleteViewFilterInputs,
    );
    if (deleteResult.status === 'failed') {
      return;
    }
  }, [
    store,
    canPersistChanges,
    currentView,
    currentRecordFiltersCallbackState,
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
  ]);

  return {
    saveRecordFiltersToViewFilters,
  };
};
