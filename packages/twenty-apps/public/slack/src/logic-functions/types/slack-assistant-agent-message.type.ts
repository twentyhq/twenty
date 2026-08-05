// Mirrors RunAgentMessage from twenty-sdk >= 2.28; local copy until the app
// bumps to an SDK release whose runAgent input types include messages.
export type SlackAssistantAgentMessageRole = 'user' | 'assistant';

export type SlackAssistantAgentMessage = {
  role: SlackAssistantAgentMessageRole;
  content: string;
};
