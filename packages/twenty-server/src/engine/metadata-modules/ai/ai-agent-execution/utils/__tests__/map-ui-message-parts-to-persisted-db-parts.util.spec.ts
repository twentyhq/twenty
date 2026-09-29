import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';

describe('mapUIMessagePartsToPersistedDBParts', () => {
  it('stores a dangling tool call as an interrupted one', () => {
    const [storedPart] = mapUIMessagePartsToPersistedDBParts(
      [
        {
          type: 'tool-search',
          toolCallId: 'call-1',
          state: 'input-available',
          input: { query: 'acme' },
        } as unknown as ExtendedUIMessagePart,
      ],
      'message-id',
      'workspace-id',
    );

    expect(storedPart).toMatchObject({
      messageId: 'message-id',
      toolCallId: 'call-1',
      state: 'output-error',
      errorMessage: 'Tool execution was interrupted.',
    });
  });

  it('drops a tool call still streaming its input', () => {
    expect(
      mapUIMessagePartsToPersistedDBParts(
        [
          { type: 'text', text: 'Looking it up' },
          {
            type: 'tool-search',
            toolCallId: 'call-1',
            state: 'input-streaming',
          } as unknown as ExtendedUIMessagePart,
        ],
        'message-id',
        'workspace-id',
      ),
    ).toEqual([
      expect.objectContaining({ type: 'text', textContent: 'Looking it up' }),
    ]);
  });
});
