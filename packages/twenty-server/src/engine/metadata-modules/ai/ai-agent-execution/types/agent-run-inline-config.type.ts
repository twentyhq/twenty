import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';

// What an agent row would otherwise supply, carried by the run so a paused one continues as it started
export type AgentRunInlineConfig = Pick<
  ResolvedAgentRunPersona,
  | 'instructions'
  | 'modelId'
  | 'modelConfiguration'
  | 'applicationId'
  | 'promptCacheKey'
> &
  Pick<ResolvedAgentRunPersona['permissions'], 'scope'>;
