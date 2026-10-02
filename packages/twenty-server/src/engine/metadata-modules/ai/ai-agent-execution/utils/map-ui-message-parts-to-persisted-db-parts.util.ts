import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { stripNulCharacters } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/strip-nul-characters.util';

// stored messages are replayed to a model, so dangling tool parts are finalized first
// and NUL characters, which Postgres text and jsonb columns reject, are stripped
export const mapUIMessagePartsToPersistedDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
  workspaceId: string,
): Partial<AgentMessagePartWorkspaceEntity>[] =>
  stripNulCharacters(
    mapUIMessagePartsToDBParts(
      finalizeDanglingToolParts(uiMessageParts),
      messageId,
      workspaceId,
    ),
  );
