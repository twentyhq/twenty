import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRootRecordFilterGroupIfEmpty = () => {
  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const removeRootRecordFilterGroupIfEmpty = () => {
    const existingRecordFilterGroups = store.get(currentRecordFilterGroups);

    const existingRecordFilters = store.get(currentRecordFilters);

    const rootRecordFilterGroup = existingRecordFilterGroups.find(
      (existingRecordFilterGroup) =>
        !isDefined(existingRecordFilterGroup.parentRecordFilterGroupId),
    );

    if (isDefined(rootRecordFilterGroup)) {
      const recordFilterGroupsInRootRecordFilterGroup =
        existingRecordFilterGroups.filter(
          (recordFilterGroupToFilter) =>
            recordFilterGroupToFilter.parentRecordFilterGroupId ===
            rootRecordFilterGroup.id,
        );

      const recordFiltersInRootRecordFilterGroup = existingRecordFilters.filter(
        (recordFilterToFilter) =>
          recordFilterToFilter.recordFilterGroupId === rootRecordFilterGroup.id,
      );

      const rootRecordFilterGroupIsEmpty =
        recordFilterGroupsInRootRecordFilterGroup.length === 0 &&
        recordFiltersInRootRecordFilterGroup.length === 0;

      if (rootRecordFilterGroupIsEmpty) {
        removeRecordFilterGroup(rootRecordFilterGroup.id);
      }
    }
  };

  return {
    removeRootRecordFilterGroupIfEmpty,
  };
};
