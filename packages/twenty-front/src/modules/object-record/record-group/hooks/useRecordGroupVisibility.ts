import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { type Atom, useStore } from 'jotai';
import { useCallback } from 'react';

// Keyed by the view instance atom instead of a ref: the submenus unmount on
// navigation, and a request from an unmounted menu must still see newer choices.
const latestRequestIdByAtom = new WeakMap<Atom<unknown>, number>();

const startRequest = (settingAtom: Atom<unknown>) => {
  const requestId = (latestRequestIdByAtom.get(settingAtom) ?? 0) + 1;

  latestRequestIdByAtom.set(settingAtom, requestId);

  return requestId;
};

const isLatestRequest = (settingAtom: Atom<unknown>, requestId: number) =>
  latestRequestIdByAtom.get(settingAtom) === requestId;

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
  // The dropdown stays open after a choice, so a second change can be made while
  // the first is still in flight: only the latest request may write the atom,
  // otherwise a late rollback would undo a choice the user has since replaced.
  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const previousHideState = store.get(recordIndexShouldHideEmptyRecordGroups);

    const newHideState = !previousHideState;

    const requestId = startRequest(recordIndexShouldHideEmptyRecordGroups);

    store.set(recordIndexShouldHideEmptyRecordGroups, newHideState);

    try {
      await updateCurrentView({
        shouldHideEmptyGroups: newHideState,
      });
    } catch (error) {
      if (isLatestRequest(recordIndexShouldHideEmptyRecordGroups, requestId)) {
        store.set(recordIndexShouldHideEmptyRecordGroups, previousHideState);
      }

      throw error;
    }
  }, [store, recordIndexShouldHideEmptyRecordGroups, updateCurrentView]);

  const handleGroupLoadLimitChange = useCallback(
    async (limit: number) => {
      const previousLimit = store.get(recordIndexGroupLoadLimit);

      const requestId = startRequest(recordIndexGroupLoadLimit);

      store.set(recordIndexGroupLoadLimit, limit);

      try {
        await updateCurrentView({
          groupLoadLimit: limit,
        });
      } catch (error) {
        if (isLatestRequest(recordIndexGroupLoadLimit, requestId)) {
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
