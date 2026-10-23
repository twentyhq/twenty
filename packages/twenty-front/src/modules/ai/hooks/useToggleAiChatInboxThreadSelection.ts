import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useToggleAiChatInboxThreadSelection = () => {
  const store = useStore();
  const { toggleRecordSelection } = useToggleRecordSelection();
  const selectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
  );
  const hasUserSelectedAllRecords = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
  );

  const toggleThreadSelection = useCallback(
    (toggle: Parameters<typeof toggleRecordSelection>[0]) => {
      toggleRecordSelection(toggle);

      // Unchecking every chat ends a select-all, so later chats load unchecked
      if (store.get(selectedRecordIds).length === 0) {
        store.set(hasUserSelectedAllRecords, false);
      }
    },
    [
      hasUserSelectedAllRecords,
      selectedRecordIds,
      store,
      toggleRecordSelection,
    ],
  );

  return { toggleThreadSelection };
};
