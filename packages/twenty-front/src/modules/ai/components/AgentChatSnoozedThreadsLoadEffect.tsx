import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListRefreshCountState } from '@/ai/states/agentChatThreadListRefreshCountState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatSnoozedThreadsLoadEffect = () => {
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const isThreadListLoaded = isDefined(
    useAtomStateValue(agentChatThreadListState),
  );
  const agentChatThreadListRefreshCount = useAtomStateValue(
    agentChatThreadListRefreshCountState,
  );
  const agentChatThreadStreamedParticipants = useAtomStateValue(
    agentChatThreadStreamedParticipantsState,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const snoozedParticipantsRevision = JSON.stringify(
    Object.values(agentChatThreadStreamedParticipants)
      .filter(
        (participant) =>
          participant.isSubscribed &&
          isDefined(participant.archivedAt) &&
          isDefined(participant.snoozedUntil),
      )
      .map(({ threadId, archivedAt, snoozedUntil }) => ({
        threadId,
        archivedAt,
        snoozedUntil,
      })),
  );
  const { refreshAgentChatSnoozedThreads } = useRefreshAgentChatThreads();
  const isPersonalSnoozedView =
    !isDefined(agentChatShownChannelView) &&
    agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED;

  useEffect(() => {
    if (isPersonalSnoozedView && isThreadListLoaded) {
      void refreshAgentChatSnoozedThreads();
    }
  }, [
    agentChatThreadListRefreshCount,
    isThreadListLoaded,
    snoozedParticipantsRevision,
    isPersonalSnoozedView,
    refreshAgentChatSnoozedThreads,
  ]);

  return null;
};
