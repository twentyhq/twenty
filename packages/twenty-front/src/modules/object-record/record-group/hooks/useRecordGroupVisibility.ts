import { useStore } from 'jotai';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useCallback, useRef } from 'react';

export const useRecordGroupVisibility = () => {
  const store = useStore();

  // Request tokens, not rendered state: they only decide whether a settling
  // mutation is still the most recent one, so they must not trigger a render.
  // oxlint-disable-next-line twenty/no-state-useref
  const latestHideEmptyRecordGroupsRequestIdRef = useRef(0);
  // oxlint-disable-next-line twenty/no-state-useref
  const latestGroupLoadLimitRequestIdRef = useRef(0);

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
  // The dropdown stays open after a choice, so a second change can be made while
  // the first is still in flight: only the latest request may write the atom,
  // otherwise a late rollback would undo a choice the user has since replaced.
  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const previousHideState = store.get(recordIndexShouldHideEmptyRecordGroups);

    const newHideState = !previousHideState;

    const requestId = ++latestHideEmptyRecordGroupsRequestIdRef.current;

    store.set(recordIndexShouldHideEmptyRecordGroups, newHideState);

    try {
      await updateCurrentView({
        shouldHideEmptyGroups: newHideState,
      });
    } catch (error) {
      if (latestHideEmptyRecordGroupsRequestIdRef.current === requestId) {
        store.set(recordIndexShouldHideEmptyRecordGroups, previousHideState);
      }

      throw error;
    }
  }, [store, recordIndexShouldHideEmptyRecordGroups, updateCurrentView]);

  const handleGroupLoadLimitChange = useCallback(
    async (limit: number) => {
      const previousLimit = store.get(recordIndexGroupLoadLimit);

      const requestId = ++latestGroupLoadLimitRequestIdRef.current;

      store.set(recordIndexGroupLoadLimit, limit);

      try {
        await updateCurrentView({
          groupLoadLimit: limit,
        });
      } catch (error) {
        if (latestGroupLoadLimitRequestIdRef.current === requestId) {
          store.set(recordIndexGroupLoadLimit, previousLimit);
        }

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
