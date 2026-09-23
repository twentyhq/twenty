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

  // A request counter, not rendered state
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

  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const currentHideState = store.get(recordIndexShouldHideEmptyRecordGroups);

    const newHideState = !currentHideState;

    store.set(recordIndexShouldHideEmptyRecordGroups, newHideState);

    await updateCurrentView({
      shouldHideEmptyGroups: newHideState,
    });
  }, [store, recordIndexShouldHideEmptyRecordGroups, updateCurrentView]);

  // A failed save restores the previous limit, since it drives what groups fetch.
  // Only the latest request may roll back: the menu stays open during a save.
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
