import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';

export const getCustomCoreAgentIds = ({
  agentIds,
  coreAgents,
  workspaceCustomApplicationId,
}: {
  agentIds: string[];
  coreAgents: Pick<CoreAgent, 'id' | 'applicationId'>[];
  workspaceCustomApplicationId?: string;
}): string[] => {
  const customAgentIds = new Set(
    coreAgents
      .filter((agent) =>
        getIsMetadataItemCustom(agent, workspaceCustomApplicationId),
      )
      .map(({ id }) => id),
  );

  return [...new Set(agentIds)].filter((id) => customAgentIds.has(id));
};
