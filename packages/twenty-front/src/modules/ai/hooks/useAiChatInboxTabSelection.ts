import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatInboxTabSelection } from '@/ai/states/agentChatInboxTabSelectionState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Without more chats to load, the loaded chats are the whole tab
export const useAiChatInboxTabSelection = (
  threads: Pick<AgentChatThreadRecord, 'id'>[],
) => {
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const hasUserSelectedAllRecords = useAtomComponentStateValue(
    hasUserSelectedAllRecordsComponentState,
  );
  const filterStatusPage =
    agentChatThreadList?.filterStatusPages?.[agentChatThreadFilterStatus];
  const isTabSelection =
    hasUserSelectedAllRecords &&
    selectedRecordIds.length > 0 &&
    filterStatusPage?.hasNextPage === true;

  const tabSelection = useMemo((): AgentChatInboxTabSelection | null => {
    if (!isTabSelection) {
      return null;
    }

    const selectedRecordIdSet = new Set(selectedRecordIds);

    return {
      filterStatus: agentChatThreadFilterStatus,
      selectedThreadIds: selectedRecordIds,
      excludedThreadIds: threads
        .map(({ id }) => id)
        .filter((threadId) => !selectedRecordIdSet.has(threadId)),
    };
  }, [agentChatThreadFilterStatus, isTabSelection, selectedRecordIds, threads]);

  if (!isDefined(tabSelection) || !isDefined(filterStatusPage)) {
    return { tabSelection, selectedThreadCount: selectedRecordIds.length };
  }

  const selectedThreadCount = Math.max(
    filterStatusPage.totalCount - tabSelection.excludedThreadIds.length,
    selectedRecordIds.length,
  );

  return { tabSelection, selectedThreadCount };
};
