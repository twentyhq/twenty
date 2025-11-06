import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilter';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordFiltersToViewFilters = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { createViewFilters, updateViewFilters, deleteViewFilters } =
    usePersistViewFilterRecords();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const saveRecordFiltersToViewFilters = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
          return;
        }

        const currentViewFilters = currentView?.viewFilters ?? [];

        const currentRecordFilters = getSnapshotValue(
          snapshot,
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
              },
            },
          }),
        );

        const deleteViewFilterInputs = viewFiltersToDelete.map(
          (viewFilter) => ({
            input: {
              id: viewFilter.id,
            },
          }),
        );

        const createResult = await createViewFilters(createViewFilterInputs);
        if (createResult.status === 'failed') {
          return;
        }

        const updateResult = await updateViewFilters(updateViewFilterInputs);
        if (updateResult.status === 'failed') {
          return;
        }

        const deleteResult = await deleteViewFilters(deleteViewFilterInputs);
        if (deleteResult.status === 'failed') {
          return;
        }
      },
    [
      canPersistChanges,
      currentView,
      currentRecordFiltersCallbackState,
      createViewFilters,
      updateViewFilters,
      deleteViewFilters,
    ],
  );

  return {
    saveRecordFiltersToViewFilters,
  };
};
