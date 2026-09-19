import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

// A shared channel splits what is open in two, the way a team inbox does:
// nobody has picked the thread up yet, or somebody has. Snoozed and done are
// the same buckets the thread's own status already names.
export const getAgentChatChannelTab = (
  thread: Pick<
    FlatAgentChatThread,
    'status' | 'snoozedUntil' | 'assigneeUserWorkspaceId'
  >,
  now?: number,
): AgentChatChannelTab => {
  const inboxState = getAgentChatThreadInboxState(thread, now);

  if (inboxState === AGENT_CHAT_THREAD_INBOX_STATE.DONE) {
    return AGENT_CHAT_CHANNEL_TAB.DONE;
  }

  if (inboxState === AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED) {
    return AGENT_CHAT_CHANNEL_TAB.SNOOZED;
  }

  return isDefined(thread.assigneeUserWorkspaceId)
    ? AGENT_CHAT_CHANNEL_TAB.ASSIGNED
    : AGENT_CHAT_CHANNEL_TAB.UNASSIGNED;
};
