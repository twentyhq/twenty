import { isDefined } from 'twenty-shared/utils';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatChannelVisibleThreadsSelector } from '@/ai/states/selectors/agentChatChannelVisibleThreadsSelector';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatInboxTabThreadListFamilyState } from '@/ai/states/agentChatInboxTabThreadListFamilyState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatInboxTabThreadsSelector } from '@/ai/states/selectors/agentChatInboxTabThreadsSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatInboxShownThreads = () => {
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatShownChannelThreadList = useAtomStateValue(
    agentChatShownChannelThreadListSelector,
  );
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatInboxTabThreadList = useAtomFamilyStateValue(
    agentChatInboxTabThreadListFamilyState,
    agentChatThreadFilterStatus,
  );
  const isChannelView = isDefined(agentChatShownChannelView);
  const { threads, loading: isThreadListLoading } = useChatThreads(
    isChannelView
      ? agentChatChannelVisibleThreadsSelector
      : agentChatInboxTabThreadsSelector,
  );

  const isShownListLoaded = isDefined(
    isChannelView
      ? agentChatShownChannelThreadList
      : agentChatInboxTabThreadList,
  );
  const isLoading = isThreadListLoading || !isShownListLoaded;

  return { threads, isLoading };
};
