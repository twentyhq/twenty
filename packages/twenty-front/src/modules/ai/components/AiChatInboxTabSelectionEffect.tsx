import { useStore } from 'jotai';
import { useEffect } from 'react';

import {
  type AgentChatInboxTabSelection,
  agentChatInboxTabSelectionState,
} from '@/ai/states/agentChatInboxTabSelectionState';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type AiChatInboxTabSelectionEffectProps = {
  tabSelection: AgentChatInboxTabSelection | null;
};

export const AiChatInboxTabSelectionEffect = ({
  tabSelection,
}: AiChatInboxTabSelectionEffectProps) => {
  const store = useStore();
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const setHasUserSelectedAllRecords = useSetAtomComponentState(
    hasUserSelectedAllRecordsComponentState,
  );

  useEffect(() => {
    store.set(agentChatInboxTabSelectionState.atom, tabSelection);

    return () => {
      store.set(agentChatInboxTabSelectionState.atom, null);
    };
  }, [store, tabSelection]);

  // So that a later cmd+click starts a plain selection
  useEffect(() => {
    if (selectedRecordIds.length === 0) {
      setHasUserSelectedAllRecords(false);
    }
  }, [selectedRecordIds.length, setHasUserSelectedAllRecords]);

  return null;
};
