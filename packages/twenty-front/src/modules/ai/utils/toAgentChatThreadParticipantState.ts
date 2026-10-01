import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';

export const toAgentChatThreadParticipantState = (
  participant: AgentChatThreadParticipantFieldsFragment,
): AgentChatThreadParticipantState => ({
  lastReadAt: participant.lastReadAt ?? null,
  archivedAt: participant.archivedAt ?? null,
  snoozedUntil: participant.snoozedUntil ?? null,
});
