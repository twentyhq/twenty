import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export type AiChatThreadParticipants = {
  // Before the member's rows load, every thread would read as unread
  isLoaded: boolean;
  rowsByThreadId: Record<string, AgentChatThreadParticipantFieldsFragment>;
};
