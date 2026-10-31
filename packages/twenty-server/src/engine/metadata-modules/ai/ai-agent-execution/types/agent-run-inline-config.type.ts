import { type AiRunScope, type ModelConfiguration } from 'twenty-shared/ai';

// What an agent row would otherwise supply, carried by the run so a paused one continues as it started
export type AgentRunInlineConfig = {
  instructions: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  // no data tools when null
  scope: AiRunScope | null;
  // the application the run is queued and billed under
  applicationId: string | null;
  promptCacheKey: string;
};
