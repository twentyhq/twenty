import {
  type AgentChatInboxState,
  AgentChatThreadConversationType,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';
import { type InboxNotificationLevel } from '@/inbox/types/InboxNotificationLevel';

export const isInboxNotificationDue = ({
  thread,
  participant,
  currentWorkspaceMemberId,
  inboxNotificationLevel,
}: {
  thread: Pick<
    AiChatThreadRecord,
    | 'deletedAt'
    | 'lastActivityAt'
    | 'lastMessageSenderWorkspaceMemberId'
    | 'conversationType'
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
    | 'assigneeId'
  >;
  participant: AgentChatInboxState | undefined;
  currentWorkspaceMemberId: string;
  inboxNotificationLevel: InboxNotificationLevel;
}): boolean => {
  if (
    inboxNotificationLevel === INBOX_NOTIFICATION_LEVEL.NONE ||
    isDefined(thread.deletedAt) ||
    !isDefined(thread.lastActivityAt) ||
    thread.lastMessageSenderWorkspaceMemberId === currentWorkspaceMemberId
  ) {
    return false;
  }

  const { isUnread, isMentioned, scope } = getAgentChatThreadInboxStatus({
    lastActivityAt: thread.lastActivityAt,
    participant,
  });

  if (isDefined(participant) && !isUnread) {
    return false;
  }

  const isDirectMessageWithMe =
    thread.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE &&
    (thread.directMessageFirstWorkspaceMemberId === currentWorkspaceMemberId ||
      thread.directMessageSecondWorkspaceMemberId === currentWorkspaceMemberId);
  const isAssignedToMe = thread.assigneeId === currentWorkspaceMemberId;

  if (isDirectMessageWithMe || isMentioned || isAssignedToMe) {
    return true;
  }

  return (
    inboxNotificationLevel === INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED &&
    scope === 'INBOX'
  );
};
