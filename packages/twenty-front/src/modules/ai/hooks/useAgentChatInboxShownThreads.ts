import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatChannelVisibleThreadsSelector } from '@/ai/states/selectors/agentChatChannelVisibleThreadsSelector';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortAgentChatThreadsBySnoozedUntil } from '@/ai/utils/sortAgentChatThreadsBySnoozedUntil';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

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

  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const agentChatSnoozedThreadList = useAtomStateValue(
    agentChatSnoozedThreadListState,
  );
  const isPersonalSnoozedView =
    !isChannelView &&
    agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED;
  const isLoading =
    isThreadListLoading ||
    (isChannelView && !isDefined(agentChatShownChannelThreadList)) ||
    (isPersonalSnoozedView && !isDefined(agentChatSnoozedThreadList));
  const isSnoozedView = isDefined(agentChatShownChannelView)
    ? agentChatShownChannelView.channelStatus ===
      AgentChatChannelThreadStatus.SNOOZED
    : agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED;
  const snoozedUntilByThreadId = Object.fromEntries(
    threads.flatMap<[string, string]>((thread) => {
      const snoozedUntil = isChannelView
        ? thread.channelSnoozedUntil
        : agentChatThreadParticipants?.[thread.id]?.snoozedUntil;

      return isDefined(snoozedUntil) ? [[thread.id, snoozedUntil]] : [];
    }),
  );

  return {
    threads: isSnoozedView
      ? sortAgentChatThreadsBySnoozedUntil({
          threads,
          snoozedUntilByThreadId,
        })
      : threads,
    isLoading,
    isPersonalSnoozedView,
  };
};
