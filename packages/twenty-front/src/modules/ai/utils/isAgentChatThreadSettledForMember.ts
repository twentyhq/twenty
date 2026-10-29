import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Re-checked by AgentChatThreadParticipantService's ARCHIVE_IF_SETTLED write, so both change together
export const isAgentChatThreadSettledForMember = ({
  thread,
  participant,
  workspaceMemberId,
}: {
  thread: Pick<
    AgentChatThreadRecord,
    | 'deletedAt'
    | 'lastActivityAt'
    | 'lastMessageSenderWorkspaceMemberId'
    | 'workspaceMemberId'
    | 'assigneeId'
    | 'pendingQuestionMessageId'
  >;
  participant: AgentChatThreadParticipantFieldsFragment | undefined;
  workspaceMemberId: string;
}) => {
  const { scope, isUnread, isMentioned } = getAgentChatThreadInboxStatus({
    lastActivityAt: thread.lastActivityAt,
    participant,
  });

  return (
    scope === 'INBOX' &&
    !isUnread &&
    !isMentioned &&
    !isDefined(thread.deletedAt) &&
    isDefined(thread.lastActivityAt) &&
    thread.workspaceMemberId === workspaceMemberId &&
    !isDefined(thread.lastMessageSenderWorkspaceMemberId) &&
    !isDefined(thread.pendingQuestionMessageId) &&
    thread.assigneeId !== workspaceMemberId
  );
};
