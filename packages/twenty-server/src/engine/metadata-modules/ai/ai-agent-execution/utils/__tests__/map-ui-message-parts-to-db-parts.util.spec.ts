import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-db-parts.util';

describe('mapUIMessagePartsToDBParts', () => {
  it('stores a dangling tool call as an interrupted one', () => {
    const [storedPart] = mapUIMessagePartsToDBParts(
      [
        {
          type: 'tool-search',
          toolCallId: 'call-1',
          state: 'input-available',
          input: { query: 'acme' },
        } as unknown as ExtendedUIMessagePart,
      ],
      'message-id',
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
      mapUIMessagePartsToDBParts(
        [
          { type: 'text', text: 'Looking it up' },
          {
            type: 'tool-search',
            toolCallId: 'call-1',
            state: 'input-streaming',
          } as unknown as ExtendedUIMessagePart,
        ],
        'message-id',
      ),
    ).toEqual([
      expect.objectContaining({ type: 'text', textContent: 'Looking it up' }),
    ]);
  });
});
