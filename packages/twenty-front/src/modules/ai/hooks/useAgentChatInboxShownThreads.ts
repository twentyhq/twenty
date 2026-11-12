import { isDefined } from 'twenty-shared/utils';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
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
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const isChannelView = isDefined(agentChatShownChannelView);
  const { threads, loading: isThreadListLoading } = useChatThreads(
    isChannelView
      ? agentChatChannelVisibleThreadsSelector
      : agentChatVisibleThreadsSelector,
  );

  const isLoading =
    isThreadListLoading ||
    (isChannelView
      ? !isDefined(agentChatShownChannelThreadList)
      : !isDefined(
          agentChatThreadList?.filterStatusPages?.[agentChatThreadFilterStatus],
        ));

  return { threads, isLoading };
};
