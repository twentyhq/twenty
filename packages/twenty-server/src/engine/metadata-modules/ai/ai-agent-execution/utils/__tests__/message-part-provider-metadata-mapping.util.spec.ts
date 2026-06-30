import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartToUIMessagePart';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';

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

    const dbParts = mapUIMessagePartsToDBParts(
      [reasoningPart],
      'message-id',
      'workspace-id',
    );

    expect(dbParts).toEqual([
      expect.objectContaining({
        type: 'reasoning',
        reasoningContent: 'reasoning summary',
        providerMetadata,
      }),
    ]);

    expect(
      mapDBPartToUIMessagePart(dbParts[0] as AgentMessagePartEntity),
    ).toEqual({
      type: 'reasoning',
      text: 'reasoning summary',
      state: 'done',
      providerMetadata,
    });
  });
});
