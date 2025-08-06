import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRootRecordFilterGroupIfEmpty = () => {
  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const removeRootRecordFilterGroupIfEmpty = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const rootRecordFilterGroup = currentRecordFilterGroups.find(
          (existingRecordFilterGroup) =>
            !isDefined(existingRecordFilterGroup.parentRecordFilterGroupId),
        );

        if (isDefined(rootRecordFilterGroup)) {
          const recordFilterGroupsInRootRecordFilterGroup =
            currentRecordFilterGroups.filter(
              (recordFilterGroupToFilter) =>
                recordFilterGroupToFilter.parentRecordFilterGroupId ===
                rootRecordFilterGroup.id,
            );

          const recordFiltersInRootRecordFilterGroup =
            currentRecordFilters.filter(
              (recordFilterToFilter) =>
                recordFilterToFilter.recordFilterGroupId ===
                rootRecordFilterGroup.id,
            );

          const rootRecordFilterGroupIsEmpty =
            recordFilterGroupsInRootRecordFilterGroup.length === 0 &&
            recordFiltersInRootRecordFilterGroup.length === 0;

          if (rootRecordFilterGroupIsEmpty) {
            removeRecordFilterGroup(rootRecordFilterGroup.id);
          }
        }
      },
    [
      removeRecordFilterGroup,
      currentRecordFilterGroupsCallbackState,
      currentRecordFiltersCallbackState,
    ],
  );

  return {
    removeRootRecordFilterGroupIfEmpty,
  };
};
