import { useLingui } from '@lingui/react/macro';

import { AiChatThreadListGroups } from '@/ai/components/AiChatThreadListGroups';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

type AiChatInboxThreadListProps = {
  inboxState: AgentChatThreadInboxState;
};

export const AiChatInboxThreadList = ({
  inboxState,
}: AiChatInboxThreadListProps) => {
  const { t } = useLingui();
  const { threadsByInboxState } = useAiChatInboxThreads();

  const emptyLabel = {
    [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: t`Your inbox is clear`,
    [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: t`Nothing snoozed`,
    [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: t`Nothing marked done yet`,
  }[inboxState];

  return (
    <AiChatThreadListGroups
      threads={threadsByInboxState[inboxState]}
      emptyLabel={emptyLabel}
    />
  );
};
