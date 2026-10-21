import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// A member's own chat waits on nobody once the agent had the last word, asked
// nothing and the member read it. Chats where someone else wrote last, or that
// are assigned to the member, keep the usual inbox rules.
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
  const { scope, isUnread } = getAgentChatThreadInboxStatus({
    lastActivityAt: thread.lastActivityAt,
    participant,
  });

  return (
    scope === 'INBOX' &&
    !isUnread &&
    !isDefined(thread.deletedAt) &&
    isDefined(thread.lastActivityAt) &&
    thread.workspaceMemberId === workspaceMemberId &&
    !isDefined(thread.lastMessageSenderWorkspaceMemberId) &&
    !isDefined(thread.pendingQuestionMessageId) &&
    thread.assigneeId !== workspaceMemberId
  );
};
