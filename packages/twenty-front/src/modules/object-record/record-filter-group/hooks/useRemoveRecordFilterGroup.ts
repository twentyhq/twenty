import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useContext } from 'react';

export const useRemoveRecordFilterGroup = () => {
  const currentRecordFilterGroupsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterGroupCallback = (
    recordFilterGroupIdToRemove: string,
  ) => {
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsAtom);

    const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
      currentRecordFilterGroups.some(
        (existingRecordFilterGroup) =>
          existingRecordFilterGroup.id === recordFilterGroupIdToRemove,
      );

    if (hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
      store.set(currentRecordFilterGroupsAtom, (currentRecordFilterGroups) => {
        const newCurrentRecordFilterGroups = [...currentRecordFilterGroups];

        const indexOfRecordFilterGroupToRemove =
          newCurrentRecordFilterGroups.findIndex(
            (existingRecordFilterGroup) =>
              existingRecordFilterGroup.id === recordFilterGroupIdToRemove,
          );

        if (indexOfRecordFilterGroupToRemove === -1) {
          return newCurrentRecordFilterGroups;
        }

        newCurrentRecordFilterGroups.splice(
          indexOfRecordFilterGroupToRemove,
          1,
        );

        return newCurrentRecordFilterGroups;
      });
    }
  };

  const removeRecordFilterGroup = (recordFilterGroupIdToRemove: string) => {
    removeRecordFilterGroupCallback(recordFilterGroupIdToRemove);
    onUpdate?.();
  };

  return {
    removeRecordFilterGroup,
  };
};
