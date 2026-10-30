import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const isAgentChatThreadInFilterStatus = ({
  thread,
  inboxStatus,
  filterStatus,
}: {
  thread: Pick<
    AgentChatThreadRecord,
    'pendingQuestionMessageId' | 'assigneeId'
  >;
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
    case 'assignedToAnyone':
      return inboxStatus.scope === 'INBOX' && isDefined(thread.assigneeId);
    case 'unassigned':
      return inboxStatus.scope === 'INBOX' && !isDefined(thread.assigneeId);
    case 'snoozed':
      return inboxStatus.scope === 'SNOOZED';
    case 'done':
      return inboxStatus.scope === 'ARCHIVED';
  }
};
