import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useContext } from 'react';

export const useUpsertRecordFilterGroup = () => {
  const currentRecordFilterGroupsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
  );
  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterGroupCallback = (
    recordFilterGroupToSet: RecordFilterGroup,
  ) => {
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsAtom);

    const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
      currentRecordFilterGroups.some(
        (existingRecordFilterGroup) =>
          existingRecordFilterGroup.id === recordFilterGroupToSet.id,
      );

    if (!hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
      store.set(currentRecordFilterGroupsAtom, [
        ...currentRecordFilterGroups,
        recordFilterGroupToSet,
      ]);
    } else {
      store.set(currentRecordFilterGroupsAtom, (currentRecordFilterGroups) => {
        const newCurrentRecordFilterGroups = [...currentRecordFilterGroups];

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
