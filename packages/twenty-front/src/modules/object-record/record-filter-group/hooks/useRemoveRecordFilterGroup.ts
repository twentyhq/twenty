import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useContext } from 'react';

export const useRemoveRecordFilterGroup = () => {
  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterGroupCallback = (
    recordFilterGroupIdToRemove: string,
  ) => {
    const existingRecordFilterGroups = store.get(currentRecordFilterGroups);

    const hasFoundRecordFilterGroupInCurrentRecordFilterGroups =
      existingRecordFilterGroups.some(
        (existingRecordFilterGroup) =>
          existingRecordFilterGroup.id === recordFilterGroupIdToRemove,
      );

    if (hasFoundRecordFilterGroupInCurrentRecordFilterGroups) {
      store.set(currentRecordFilterGroups, (previousRecordFilterGroups) => {
        const newCurrentRecordFilterGroups = [...previousRecordFilterGroups];

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
