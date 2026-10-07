export type AgentRunToolCallLog = {
  toolName: string;
  toolCallId: string;
  providerExecuted?: boolean;
  input?: unknown;
  output?: unknown;
  errorMessage?: string;
  state: 'started' | 'success' | 'error' | 'awaiting-approval';
};
