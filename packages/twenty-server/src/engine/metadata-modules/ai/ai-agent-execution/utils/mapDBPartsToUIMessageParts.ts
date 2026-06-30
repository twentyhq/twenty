import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartToUIMessagePart';

export const mapDBPartsToUIMessageParts = (
  parts: AgentMessagePartEntity[],
): ExtendedUIMessagePart[] => {
  return parts
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapDBPartToUIMessagePart)
    .filter((part): part is ExtendedUIMessagePart => part !== null);
};
