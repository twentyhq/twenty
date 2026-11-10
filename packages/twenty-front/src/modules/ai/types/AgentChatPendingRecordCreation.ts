import { type ProposedToolCall } from 'twenty-shared/ai';

export type AgentChatPendingRecordCreation = {
  toolCallId: string;
  proposal: ProposedToolCall & {
    template: 'recordCreate';
    objectNameSingular: string;
  };
};
