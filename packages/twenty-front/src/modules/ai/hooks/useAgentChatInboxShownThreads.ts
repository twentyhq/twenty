import { isDefined } from 'twenty-shared/utils';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatChannelVisibleThreadsSelector } from '@/ai/states/selectors/agentChatChannelVisibleThreadsSelector';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatInboxShownThreads = () => {
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatShownChannelThreadList = useAtomStateValue(
    agentChatShownChannelThreadListSelector,
  );
  const isChannelView = isDefined(agentChatShownChannelView);
  const { threads, loading: isThreadListLoading } = useChatThreads(
    isChannelView
      ? agentChatChannelVisibleThreadsSelector
      : agentChatVisibleThreadsSelector,
  );

  const isLoading =
    isThreadListLoading ||
    (isChannelView && !isDefined(agentChatShownChannelThreadList));

  return { threads, isLoading };
};
