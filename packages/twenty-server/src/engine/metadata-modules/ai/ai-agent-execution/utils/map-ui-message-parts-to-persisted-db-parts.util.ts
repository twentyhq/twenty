import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';

// A stored message is replayed to a model later, so a dangling tool part must
// be finalized before it is stored, whichever path records the message.
export const mapUIMessagePartsToPersistedDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
  workspaceId: string,
): Partial<AgentMessagePartWorkspaceEntity>[] =>
  mapUIMessagePartsToDBParts(
    finalizeDanglingToolParts(uiMessageParts),
    messageId,
    workspaceId,
  );
