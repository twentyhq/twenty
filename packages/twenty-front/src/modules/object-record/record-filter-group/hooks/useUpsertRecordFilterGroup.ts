import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useContext } from 'react';

export const useUpsertRecordFilterGroup = () => {
  const currentRecordFilterGroups = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
  );
  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterGroupCallback = (
    recordFilterGroupToSet: RecordFilterGroup,
  ) => {
    const existingRecordFilterGroups = store.get(currentRecordFilterGroups);

    const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
      existingRecordFilterGroups.some(
        (existingRecordFilterGroup) =>
          existingRecordFilterGroup.id === recordFilterGroupToSet.id,
      );

    if (!hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
      store.set(currentRecordFilterGroups, [
        ...existingRecordFilterGroups,
        recordFilterGroupToSet,
      ]);
    } else {
      store.set(currentRecordFilterGroups, (previousRecordFilterGroups) => {
        const newCurrentRecordFilterGroups = [...previousRecordFilterGroups];

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
      });
    }
  };

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
