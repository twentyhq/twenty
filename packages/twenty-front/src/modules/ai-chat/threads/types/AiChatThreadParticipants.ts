import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export type AiChatThreadParticipants = {
  isLoaded: boolean;
  rowsByThreadId: Record<string, AgentChatThreadParticipantFieldsFragment>;
};
