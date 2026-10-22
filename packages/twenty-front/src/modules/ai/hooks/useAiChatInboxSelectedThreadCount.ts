import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatInboxTabSelection } from '@/ai/types/AgentChatInboxTabSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatInboxSelectedThreadCount = (
  tabSelection: AgentChatInboxTabSelection | null,
) => {
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const filterStatusPage = isDefined(tabSelection)
    ? agentChatThreadList?.filterStatusPages?.[tabSelection.filterStatus]
    : undefined;

  if (!isDefined(tabSelection) || !isDefined(filterStatusPage)) {
    return selectedRecordIds.length;
  }

  return Math.max(
    filterStatusPage.totalCount - tabSelection.excludedThreadIds.length,
    selectedRecordIds.length,
  );
};
