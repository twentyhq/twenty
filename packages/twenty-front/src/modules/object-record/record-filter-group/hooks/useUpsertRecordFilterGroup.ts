import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordFilterGroup = () => {
  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);
  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterGroupCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordFilterGroupToSet: RecordFilterGroup) => {
        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
          currentRecordFilterGroups.some(
            (existingRecordFilterGroup) =>
              existingRecordFilterGroup.id === recordFilterGroupToSet.id,
          );

        if (!hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
          set(currentRecordFilterGroupsCallbackState, [
            ...currentRecordFilterGroups,
            recordFilterGroupToSet,
          ]);
        } else {
          set(
            currentRecordFilterGroupsCallbackState,
            (currentRecordFilterGroups) => {
              const newCurrentRecordFilterGroups = [
                ...currentRecordFilterGroups,
              ];

              const indexOfRecordFilterGroupToUpdate =
                newCurrentRecordFilterGroups.findIndex(
                  (existingRecordFilterGroup) =>
                    existingRecordFilterGroup.id === recordFilterGroupToSet.id,
                );

              if (indexOfRecordFilterGroupToUpdate === -1) {
                return newCurrentRecordFilterGroups;
              }

              newCurrentRecordFilterGroups[indexOfRecordFilterGroupToUpdate] = {
                ...recordFilterGroupToSet,
              };

              return newCurrentRecordFilterGroups;
            },
          );
        }
      },
    [currentRecordFilterGroupsCallbackState],
  );

  const upsertRecordFilterGroup = (
    recordFilterGroupToSet: RecordFilterGroup,
  ) => {
    upsertRecordFilterGroupCallback(recordFilterGroupToSet);
    onUpdate?.();
  };

  return {
    upsertRecordFilterGroup,
  };
};
