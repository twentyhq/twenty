import { type ToolSet } from 'ai';

export type AgentExecutionSnapshot = {
  agentName: string;
  agentDescription: string | null;
  systemPrompt: string;
  availableTools: ToolSet;
};
