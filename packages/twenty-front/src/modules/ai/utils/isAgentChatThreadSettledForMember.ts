import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

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
