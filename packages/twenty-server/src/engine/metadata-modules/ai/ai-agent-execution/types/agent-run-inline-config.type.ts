import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';

// What an agent row would otherwise supply, carried by the run so a paused one continues as it started
export type AgentRunInlineConfig = Pick<
  ResolvedAgentRunPersona,
  'instructions' | 'modelId' | 'modelConfiguration' | 'promptCacheKey'
> &
  Pick<ResolvedAgentRunPersona['permissions'], 'scope'> & {
    // the application the caller runs under, so the run is never left to the workspace
    applicationId: string;
  };
