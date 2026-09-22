import { useStore } from 'jotai';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useCallback } from 'react';

export const useRecordGroupVisibility = () => {
  const store = useStore();

  const recordIndexShouldHideEmptyRecordGroups =
    useAtomComponentStateCallbackState(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const recordIndexGroupLoadLimit = useAtomComponentStateCallbackState(
    recordIndexGroupLoadLimitComponentState,
  );

  const { saveViewGroup } = useSaveCurrentViewGroups();
  const { updateCurrentView } = useUpdateCurrentView();

  const handleVisibilityChange = useCallback(
    async (updatedRecordGroup: RecordGroupDefinition) => {
      store.set(
        recordGroupDefinitionFamilyState.atomFamily(updatedRecordGroup.id),
        updatedRecordGroup,
      );

      saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
    },
    [saveViewGroup, store],
  );

  // These atoms drive what the grouped index renders and fetches, so a rejected
  // mutation has to put the previous value back: the menu would otherwise keep
  // showing a setting the view never took. The error is rethrown so failures
  // stay as visible as they were before the rollback.
  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const previousHideState = store.get(recordIndexShouldHideEmptyRecordGroups);

    const newHideState = !previousHideState;

    store.set(recordIndexShouldHideEmptyRecordGroups, newHideState);

    try {
      await updateCurrentView({
        shouldHideEmptyGroups: newHideState,
      });
    } catch (error) {
      store.set(recordIndexShouldHideEmptyRecordGroups, previousHideState);

      throw error;
    }
  }, [store, recordIndexShouldHideEmptyRecordGroups, updateCurrentView]);

  const handleGroupLoadLimitChange = useCallback(
    async (limit: number) => {
      const previousLimit = store.get(recordIndexGroupLoadLimit);

      store.set(recordIndexGroupLoadLimit, limit);

      try {
        await updateCurrentView({
          groupLoadLimit: limit,
        });
      } catch (error) {
        store.set(recordIndexGroupLoadLimit, previousLimit);

        throw error;
      }
    },
    [store, recordIndexGroupLoadLimit, updateCurrentView],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
    handleGroupLoadLimitChange,
  };
};
