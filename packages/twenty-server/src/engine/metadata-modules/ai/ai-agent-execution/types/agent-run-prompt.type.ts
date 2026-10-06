import { type RunAgentMessage } from 'twenty-shared/application';

// what a run is asked, and who asked it
export type AgentRunPrompt = {
  messages: RunAgentMessage[];
  senderUserWorkspaceId: string | null;
  senderApplicationId: string | null;
};
