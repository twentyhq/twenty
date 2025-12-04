export type SimplifiedTool = {
  description?: string;
  parameters?: string[];
};

export type AgentExecutionSnapshot = {
  agentName: string;
  agentDescription: string | null;
  systemPrompt: string;
  availableTools: Record<string, SimplifiedTool>;
};
