import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { findToolPart } from '@/ai-chat/tool-calls/utils/findToolPart';

const MESSAGES: ExtendedUIMessage[] = [
  {
    id: 'user-message',
    role: 'user',
    parts: [{ type: 'text', text: 'Find Clearstreet' }],
  },
  {
    id: 'assistant-message',
    role: 'assistant',
    parts: [
      {
        type: 'tool-find_companies',
        toolCallId: 'static-call',
        state: 'output-available',
        input: { name: 'Clearstreet' },
        output: { success: true },
      },
      {
        type: 'dynamic-tool',
        toolName: 'http_request',
        toolCallId: 'dynamic-call',
        state: 'output-error',
        input: { url: 'https://example.com' },
        errorText: 'Timed out',
      },
    ],
  },
];

describe('findToolPart', () => {
  it('finds a static tool part by its call id', () => {
    expect(
      findToolPart({ messages: MESSAGES, toolCallId: 'static-call' }),
    ).toMatchObject({ type: 'tool-find_companies', output: { success: true } });
  });

  it('finds a dynamic tool part by its call id', () => {
    expect(
      findToolPart({ messages: MESSAGES, toolCallId: 'dynamic-call' }),
    ).toMatchObject({ type: 'dynamic-tool', errorText: 'Timed out' });
  });

  it('returns undefined when no part has the call id', () => {
    expect(
      findToolPart({ messages: MESSAGES, toolCallId: 'unknown-call' }),
    ).toBeUndefined();
  });
});
