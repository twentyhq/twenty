import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';

import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';

export type ResolvedAgentRunPersona = {
  agentId: string | null;
  isSystemAgent: boolean;
  // the application the run is queued and billed under
  applicationId: string | null;
  instructions: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  responseFormat: AgentResponseFormat | null;
  promptCacheKey: string;
  permissions: {
    agentRoleId: string | null;
    scope: AiRunScope | null;
    // null when the run may use no data tools at all
    explicitObjectGrants: ExplicitObjectGrants | null;
  };
};
