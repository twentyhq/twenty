import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { type Atom, useStore, type WritableAtom } from 'jotai';
import { useCallback } from 'react';

type SettingSaveQueue = {
  latestRequestId: number;
  pendingRequestCount: number;
  lastSave: Promise<void>;
  restoreSavedValue: () => void;
};

// Keyed by the view instance atom instead of a ref: the submenus unmount on
// navigation, and a request from an unmounted menu must still see newer choices.
const saveQueueByAtom = new WeakMap<Atom<unknown>, SettingSaveQueue>();

// The dropdown stays open after a choice, so several changes can be made while a
// save is in flight. Concurrent mutations can reach the server in any order, so
// saves run one after the other and a queued save is dropped once a newer choice
// replaces it: the last choice is always the last one written.
// These atoms drive what the grouped index renders and fetches, so a rejected
// latest save puts back the last value the server accepted, and the error is
// rethrown so failures stay as visible as they were before the rollback.
const saveSettingInOrder = async <TValue>({
  store,
  settingAtom,
  value,
  saveValue,
}: {
  store: ReturnType<typeof useStore>;
  settingAtom: WritableAtom<TValue, [TValue], void>;
  value: TValue;
  saveValue: () => Promise<void>;
}) => {
  const saveQueue = saveQueueByAtom.get(settingAtom) ?? {
    latestRequestId: 0,
    pendingRequestCount: 0,
    lastSave: Promise.resolve(),
    restoreSavedValue: () => {},
  };

  saveQueueByAtom.set(settingAtom, saveQueue);

  const isSaveInFlight = saveQueue.pendingRequestCount > 0;

  if (!isSaveInFlight) {
    const savedValue = store.get(settingAtom);

    saveQueue.restoreSavedValue = () => store.set(settingAtom, savedValue);
  }

  const requestId = saveQueue.latestRequestId + 1;

  saveQueue.latestRequestId = requestId;
  saveQueue.pendingRequestCount += 1;

  store.set(settingAtom, value);

  const isLatestRequest = () => saveQueue.latestRequestId === requestId;

  const runSave = async () => {
    if (!isLatestRequest()) {
      return;
    }

    await saveValue();

    saveQueue.restoreSavedValue = () => store.set(settingAtom, value);
  };

  const save = isSaveInFlight
    ? saveQueue.lastSave.catch(() => undefined).then(runSave)
    : runSave();

  saveQueue.lastSave = save;

  try {
    await save;
  } catch (error) {
    if (isLatestRequest()) {
      saveQueue.restoreSavedValue();
    }

    throw error;
  } finally {
    saveQueue.pendingRequestCount -= 1;
  }
};

export const useRecordGroupVisibility = () => {
  const store = useStore();

  const recordIndexShouldHideEmptyRecordGroups =
    useAtomComponentStateCallbackState(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const recordIndexGroupLoadLimit = useAtomComponentStateCallbackState(
    recordIndexGroupLoadLimitComponentState,
  );

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
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

  // updateCurrentView writes to whichever view is current when it runs, and a
  // queued save runs later: it must not land on a view the user switched to.
  const updateViewOfCurrentChoice = useCallback(
    (viewUpdate: Parameters<typeof updateCurrentView>[0]) => {
      const viewIdOfChoice = store.get(currentViewIdCallbackState);

      return async () => {
        if (store.get(currentViewIdCallbackState) !== viewIdOfChoice) {
          return;
        }

        await updateCurrentView(viewUpdate);
      };
    },
    [store, currentViewIdCallbackState, updateCurrentView],
  );

  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const newHideState = !store.get(recordIndexShouldHideEmptyRecordGroups);

    await saveSettingInOrder({
      store,
      settingAtom: recordIndexShouldHideEmptyRecordGroups,
      value: newHideState,
      saveValue: updateViewOfCurrentChoice({
        shouldHideEmptyGroups: newHideState,
      }),
    });
  }, [
    store,
    recordIndexShouldHideEmptyRecordGroups,
    updateViewOfCurrentChoice,
  ]);

  const handleGroupLoadLimitChange = useCallback(
    async (limit: number) => {
      await saveSettingInOrder({
        store,
        settingAtom: recordIndexGroupLoadLimit,
        value: limit,
        saveValue: updateViewOfCurrentChoice({ groupLoadLimit: limit }),
      });
    },
    [store, recordIndexGroupLoadLimit, updateViewOfCurrentChoice],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
    handleGroupLoadLimitChange,
  };
};
