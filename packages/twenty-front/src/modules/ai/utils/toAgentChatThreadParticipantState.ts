import { type AgentChatThreadParticipantState } from 'twenty-shared/types';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const toAgentChatThreadParticipantState = (
  participant: AgentChatThreadParticipantFieldsFragment,
): AgentChatThreadParticipantState => ({
  lastReadAt: participant.lastReadAt ?? null,
  archivedAt: participant.archivedAt ?? null,
  snoozedUntil: participant.snoozedUntil ?? null,
});
