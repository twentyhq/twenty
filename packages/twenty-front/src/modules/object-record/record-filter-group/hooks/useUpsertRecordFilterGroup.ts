import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordFilterGroup = () => {
  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(currentRecordFilterGroupsComponentState);

  const upsertRecordFilterGroup = useRecoilCallback(
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

  return {
    upsertRecordFilterGroup,
  };
};
