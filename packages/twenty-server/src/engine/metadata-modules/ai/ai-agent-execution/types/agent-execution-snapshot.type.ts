export type AgentExecutionSnapshot = {
  agentName: string;
  agentDescription: string | null;
  systemPrompt: string;
  availableTools: Record<string, { description?: string }>;
};
