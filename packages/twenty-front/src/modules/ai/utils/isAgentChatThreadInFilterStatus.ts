import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

// Needs input, Mentions and Assigned narrow the open chats, so a chat leaves them once
// it is done or snoozed
export const isAgentChatThreadInFilterStatus = ({
  thread,
  inboxStatus,
  filterStatus,
}: {
  thread: Pick<AgentChatThreadRecord, 'pendingQuestionMessageId'>;
  inboxStatus: Pick<
    AgentChatThreadInboxStatus,
    'scope' | 'isMentioned' | 'isAssignedToMe'
  >;
  filterStatus: AgentChatThreadFilterStatus;
}): boolean => {
  switch (filterStatus) {
    case 'active':
      return inboxStatus.scope === 'INBOX';
    case 'needsInput':
      return (
        inboxStatus.scope === 'INBOX' &&
        isDefined(thread.pendingQuestionMessageId)
      );
    case 'mentions':
      return inboxStatus.scope === 'INBOX' && inboxStatus.isMentioned;
    case 'assigned':
      return inboxStatus.scope === 'INBOX' && inboxStatus.isAssignedToMe;
    case 'snoozed':
      return inboxStatus.scope === 'SNOOZED';
    case 'done':
      return inboxStatus.scope === 'ARCHIVED';
  }
};
