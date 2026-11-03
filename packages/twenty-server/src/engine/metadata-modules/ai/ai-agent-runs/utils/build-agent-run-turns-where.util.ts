import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, LessThan } from 'typeorm';

import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

export const buildAgentRunTurnsWhere = ({
  agentId,
  cursor,
}: {
  agentId: string;
  cursor?: Pick<AgentTurnWorkspaceEntity, 'createdAt' | 'id'>;
}): FindOptionsWhere<AgentTurnWorkspaceEntity>[] => {
  if (!isDefined(cursor)) {
    return [{ agentId }];
  }

  return [
    { agentId, createdAt: LessThan(cursor.createdAt) },
    { agentId, createdAt: cursor.createdAt, id: LessThan(cursor.id) },
  ];
};
