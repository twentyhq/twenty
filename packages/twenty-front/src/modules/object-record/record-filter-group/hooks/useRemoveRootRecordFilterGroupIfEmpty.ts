import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRootRecordFilterGroupIfEmpty = () => {
  const currentRecordFilterGroupsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFiltersAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const removeRootRecordFilterGroupIfEmpty = () => {
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsAtom);

    const currentRecordFilters = store.get(currentRecordFiltersAtom);

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

      const recordFiltersInRootRecordFilterGroup = currentRecordFilters.filter(
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
