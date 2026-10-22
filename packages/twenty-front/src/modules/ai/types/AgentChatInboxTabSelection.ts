import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

export type AgentChatInboxTabSelection = {
  filterStatus: AgentChatThreadFilterStatus;
  selectedThreadIds: string[];
  excludedThreadIds: string[];
};
