import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartToUIMessagePart';

export const mapDBPartsToUIMessageParts = (
  parts: AgentMessagePartWorkspaceEntity[],
): ExtendedUIMessagePart[] => {
  return parts
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapDBPartToUIMessagePart)
    .filter((part): part is ExtendedUIMessagePart => part !== null);
};
