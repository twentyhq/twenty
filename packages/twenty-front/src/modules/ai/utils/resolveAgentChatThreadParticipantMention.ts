import { getAgentChatMentionsResolvedAt } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const resolveAgentChatThreadParticipantMention = ({
  participants,
  threadId,
  lastMentionedAt,
}: {
  participants: Record<string, AgentChatThreadParticipantFieldsFragment> | null;
  threadId: string;
  lastMentionedAt: string | null | undefined;
}): Record<string, AgentChatThreadParticipantFieldsFragment> | null => {
  const participant = participants?.[threadId];

  if (!isDefined(participants) || !isDefined(participant)) {
    return participants;
  }

  const mentionsResolvedAt = getAgentChatMentionsResolvedAt({
    lastMentionedAt,
    mentionsResolvedAt: participant.mentionsResolvedAt,
  });

  if (mentionsResolvedAt === participant.mentionsResolvedAt) {
    return participants;
  }

  return {
    ...participants,
    [threadId]: { ...participant, mentionsResolvedAt },
  };
};
