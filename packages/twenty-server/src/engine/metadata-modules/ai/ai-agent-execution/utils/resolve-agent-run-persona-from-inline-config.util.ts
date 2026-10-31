import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { type AgentRunInlineConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-inline-config.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';

export const resolveAgentRunPersonaFromInlineConfig = (
  inlineConfig: AgentRunInlineConfig,
): ResolvedAgentRunPersona => ({
  agentId: null,
  isSystemAgent: false,
  applicationId: inlineConfig.applicationId,
  instructions: tipTapDocumentToMarkdown(inlineConfig.instructions),
  modelId: inlineConfig.modelId,
  modelConfiguration: inlineConfig.modelConfiguration,
  responseFormat: null,
  promptCacheKey: inlineConfig.promptCacheKey,
  permissions: {
    agentRoleId: null,
    scope: inlineConfig.scope,
    explicitObjectGrants: inlineConfig.scope,
  },
});
