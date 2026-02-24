import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordFilterGroupsToViewFilterGroups = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDelete,
  } = usePerformViewFilterGroupAPIPersist();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentStateCallbackStateV2(
      currentRecordFilterGroupsComponentState,
    );

  const store = useStore();

  const saveRecordFilterGroupsToViewFilterGroups = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    const currentViewFilterGroups = currentView?.viewFilterGroups ?? [];

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

    const viewFilterGroupIdsToDelete = viewFilterGroupsToDelete.map(
      (viewFilterGroup) => viewFilterGroup.id,
    );

    await performViewFilterGroupAPICreate(
      viewFilterGroupsToCreate,
      currentView,
    );
    await performViewFilterGroupAPIUpdate(viewFilterGroupsToUpdate);
    await performViewFilterGroupAPIDelete(viewFilterGroupIdsToDelete);
  }, [
    store,
    canPersistChanges,
    currentView,
    currentRecordFilterGroupsCallbackState,
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDelete,
  ]);

  return {
    saveRecordFilterGroupsToViewFilterGroups,
  };
};
