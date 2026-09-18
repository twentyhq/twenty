import { useLingui } from '@lingui/react/macro';

import { AiChatThreadListGroups } from '@/ai/components/AiChatThreadListGroups';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';

type AiChatChannelThreadListProps = {
  channelId: string;
  inboxState: AgentChatThreadInboxState;
};

export const AiChatChannelThreadList = ({
  channelId,
  inboxState,
}: AiChatChannelThreadListProps) => {
  const { t } = useLingui();
  const { threads } = useChatThreads();

  const channelThreads = threads.filter(
    (thread) =>
      thread.channelId === channelId &&
      getAgentChatThreadInboxState(thread) === inboxState,
  );

  const emptyLabel = {
    [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: t`No chat in this channel yet`,
    [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: t`Nothing snoozed here`,
    [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: t`Nothing marked done here`,
  }[inboxState];

  return (
    <AiChatThreadListGroups threads={channelThreads} emptyLabel={emptyLabel} />
  );
};
