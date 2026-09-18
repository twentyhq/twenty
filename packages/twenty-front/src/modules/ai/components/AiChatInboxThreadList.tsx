import { useLingui } from '@lingui/react/macro';

import { AiChatThreadListGroups } from '@/ai/components/AiChatThreadListGroups';
import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

type AiChatInboxThreadListProps = {
  inboxState: AgentChatThreadInboxState;
  inboxTab: AgentChatInboxTab;
};

export const AiChatInboxThreadList = ({
  inboxState,
  inboxTab,
}: AiChatInboxThreadListProps) => {
  const { t } = useLingui();
  const { getThreadsForInboxStateAndTab } = useAiChatInboxThreads();

  // The tab says more about why a list is empty than the state does, so it
  // speaks first and only the untabbed view falls back to the state.
  const emptyLabelByInboxTab = {
    [AGENT_CHAT_INBOX_TAB.ASSIGNED]: t`Nothing is assigned to you`,
    [AGENT_CHAT_INBOX_TAB.SUBSCRIBED]: t`Nobody has tagged you`,
    [AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES]: t`No direct messages`,
    [AGENT_CHAT_INBOX_TAB.ALL]: {
      [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: t`Your inbox is clear`,
      [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: t`Nothing snoozed`,
      [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: t`Nothing marked done yet`,
    }[inboxState],
  };

  return (
    <AiChatThreadListGroups
      threads={getThreadsForInboxStateAndTab(inboxState, inboxTab)}
      emptyLabel={emptyLabelByInboxTab[inboxTab]}
    />
  );
};
