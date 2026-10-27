import { describe, expect, it, vi } from 'vitest';

import { createServerSentEventParser } from '@/sdk/front-component/utils/createServerSentEventParser';

describe('createServerSentEventParser', () => {
  it('emits events split across chunks and skips heartbeat comments', () => {
    const onEvent = vi.fn();
    const push = createServerSentEventParser(onEvent);

    push(': heartbeat\n\nid: 1\nevent: occur');
    push('rence\ndata: {"a":1}\n\n');

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      id: '1',
      event: 'occurrence',
      data: '{"a":1}',
    });
  });

  it('joins multi-line data and normalizes CRLF line endings', () => {
    const onEvent = vi.fn();
    const push = createServerSentEventParser(onEvent);

    push('data: first\r\ndata: second\r\n\r\n');

    expect(onEvent).toHaveBeenCalledWith({
      id: null,
      event: 'message',
      data: 'first\nsecond',
    });
  });
});
