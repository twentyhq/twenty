import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

// The three reasons a thread is somebody's own business, as tabs. A thread can
// answer to more than one of them at once — a direct message can also be
// assigned — so these are filters over the inbox rather than buckets that
// partition it, and All is their union.
//
// Direct messages need no participant lookup: a thread outside every channel
// is only ever readable by the people in it, so one that reached this client
// is one the reader is in.
export const isThreadInAgentChatInboxTab = (
  thread: FlatAgentChatThread,
  inboxTab: AgentChatInboxTab,
  userWorkspaceId: string,
): boolean => {
  switch (inboxTab) {
    case AGENT_CHAT_INBOX_TAB.ASSIGNED:
      return thread.assigneeUserWorkspaceId === userWorkspaceId;
    case AGENT_CHAT_INBOX_TAB.SUBSCRIBED:
      return (
        isDefined(thread.channelId) &&
        thread.mentionedUserWorkspaceIds.includes(userWorkspaceId)
      );
    case AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES:
      return !isDefined(thread.channelId) && !isDefined(thread.workflowRunId);
    case AGENT_CHAT_INBOX_TAB.ALL:
      return true;
  }
};
