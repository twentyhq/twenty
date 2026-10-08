import { type ObjectRecord } from 'twenty-shared/types';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Record events carry the whole row, along with fields the inbox has no use for
export const getAgentChatThreadParticipantFromRecord = (
  record: ObjectRecord,
): AgentChatThreadParticipantFieldsFragment => ({
  id: record.id,
  threadId: record.threadId,
  lastReadAt: record.lastReadAt ?? null,
  doneAt: record.doneAt ?? null,
  snoozedUntil: record.snoozedUntil ?? null,
  isSubscribed: record.isSubscribed ?? true,
  lastMentionedAt: record.lastMentionedAt ?? null,
  updatedAt: record.updatedAt,
});
