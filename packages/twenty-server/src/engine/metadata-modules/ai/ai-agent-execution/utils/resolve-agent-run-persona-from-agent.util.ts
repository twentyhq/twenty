import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

export const resolveAgentRunPersonaFromAgent = ({
  agent,
  agentRoleId,
  explicitObjectGrants,
}: {
  agent: Pick<
    AgentEntity,
    | 'id'
    | 'applicationId'
    | 'prompt'
    | 'modelId'
    | 'modelConfiguration'
    | 'responseFormat'
  >;
} & Pick<
  ResolvedAgentRunPersona['permissions'],
  'agentRoleId' | 'explicitObjectGrants'
>): ResolvedAgentRunPersona => ({
  agentId: agent.id,
  applicationId: agent.applicationId,
  instructions: tipTapDocumentToMarkdown(agent.prompt),
  modelId: agent.modelId,
  modelConfiguration: agent.modelConfiguration ?? null,
  responseFormat: agent.responseFormat ?? null,
  promptCacheKey: agent.id,
  permissions: { agentRoleId, scope: null, explicitObjectGrants },
});
