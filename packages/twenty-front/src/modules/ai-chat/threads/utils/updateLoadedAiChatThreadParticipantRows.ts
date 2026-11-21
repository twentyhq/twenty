import { type AiChatThreadParticipants } from '@/ai-chat/threads/types/AiChatThreadParticipants';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

type ParticipantRows = Record<string, AgentChatThreadParticipantFieldsFragment>;

export const updateLoadedAiChatThreadParticipantRows =
  (updateRows: (rows: ParticipantRows) => ParticipantRows) =>
  (participants: AiChatThreadParticipants): AiChatThreadParticipants =>
    participants.isLoaded
      ? {
          ...participants,
          rowsByThreadId: updateRows(participants.rowsByThreadId),
        }
      : participants;
