import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-db-parts-to-ui-message-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-db-parts.util';

describe('message part provider metadata mapping', () => {
  it('persists and restores OpenAI encrypted reasoning metadata', () => {
    const providerMetadata = {
      openai: {
        itemId: 'rs_123',
        reasoningEncryptedContent: 'encrypted-content',
      },
    };

    const reasoningPart = {
      type: 'reasoning',
      text: 'reasoning summary',
      state: 'done',
      providerMetadata,
    } satisfies ExtendedUIMessagePart;

    const dbParts = mapUIMessagePartsToDBParts([reasoningPart], 'message-id');

    expect(dbParts).toEqual([
      expect.objectContaining({
        type: 'reasoning',
        reasoningContent: 'reasoning summary',
        providerMetadata,
      }),
    ]);

    expect(
      mapDBPartToUIMessagePart(dbParts[0] as AgentMessagePartWorkspaceEntity),
    ).toEqual({
      type: 'reasoning',
      text: 'reasoning summary',
      state: 'done',
      providerMetadata,
    });
  });
});
