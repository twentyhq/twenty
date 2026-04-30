export type AgentStatus = 'active' | 'paused' | 'error' | 'training';

export type AIAgentData = {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  model: string;
  totalCalls: number;
  avgLatencyMs: number;
  lastActiveAt: string;
};

export type AIUsageMetrics = {
  period: string;
  tokensUsed: number;
  totalCost: number;
  apiCalls: number;
  avgLatencyMs: number;
  currency: string;
};

export type PIIRule = {
  id: string;
  fieldName: string;
  pattern: string;
  maskType: 'redact' | 'hash' | 'partial_mask' | 'tokenize';
  isActive: boolean;
  matchCount: number;
};
