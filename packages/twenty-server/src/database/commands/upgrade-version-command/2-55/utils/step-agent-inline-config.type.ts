import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { type WorkflowConversation } from 'twenty-shared/workflow';

export type StepAgentInlineConfig = {
  instructions: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  responseFormat: AgentResponseFormat | null;
  // null when the agent had no role, so the step keeps having no data tools
  scope: AiRunScope | null;
};

export type StoredWorkflowStep = {
  id?: unknown;
  type?: unknown;
  name?: unknown;
  settings?: {
    input?: Record<string, unknown> & { conversation?: WorkflowConversation };
  } & Record<string, unknown>;
} & Record<string, unknown>;
