import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const useRemoveRecordFilterGroup = () => {
  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterGroupCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordFilterGroupIdToRemove: string) => {
        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
          currentRecordFilterGroups.some(
            (existingRecordFilterGroup) =>
              existingRecordFilterGroup.id === recordFilterGroupIdToRemove,
          );

        if (hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
          set(
            currentRecordFilterGroupsCallbackState,
            (currentRecordFilterGroups) => {
              const newCurrentRecordFilterGroups = [
                ...currentRecordFilterGroups,
              ];

              const indexOfRecordFilterGroupToRemove =
                newCurrentRecordFilterGroups.findIndex(
                  (existingRecordFilterGroup) =>
                    existingRecordFilterGroup.id ===
                    recordFilterGroupIdToRemove,
                );

              if (indexOfRecordFilterGroupToRemove === -1) {
                return newCurrentRecordFilterGroups;
              }

              newCurrentRecordFilterGroups.splice(
                indexOfRecordFilterGroupToRemove,
                1,
              );

              return newCurrentRecordFilterGroups;
            },
          );
        }
      },
    [currentRecordFilterGroupsCallbackState],
  );

  const removeRecordFilterGroup = (recordFilterGroupIdToRemove: string) => {
    removeRecordFilterGroupCallback(recordFilterGroupIdToRemove);
    onUpdate?.();
  };

  return {
    removeRecordFilterGroup,
  };
};
