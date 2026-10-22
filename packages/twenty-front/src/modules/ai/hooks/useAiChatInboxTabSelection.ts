import { useMemo } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatInboxTabSelection } from '@/ai/types/AgentChatInboxTabSelection';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
    isNonEmptyArray(selectedRecordIds) &&
    (filterStatusPage?.hasNextPage ?? false);

  return useMemo((): AgentChatInboxTabSelection | null => {
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
};
