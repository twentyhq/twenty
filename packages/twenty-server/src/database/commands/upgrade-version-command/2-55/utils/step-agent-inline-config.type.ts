import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';

export type StepAgentInlineConfig = {
  instructions: string;
  modelId: string;
  modelConfiguration: {
    webSearch?: { enabled: boolean };
    twitterSearch?: { enabled: boolean };
  } | null;
  responseFormat: AgentResponseFormat | null;
  // null when the agent had no role, so the step keeps having no data tools
  scope: AiRunScope | null;
};

export type StoredWorkflowStep = {
  id?: unknown;
  type?: unknown;
  settings?: { input?: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;
