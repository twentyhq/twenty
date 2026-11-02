import { describe, expect, it } from 'vitest';

import { INBOX_ASSISTANT_MENTION } from '@/sdk/inbox/mentions/inbox-assistant-mention';

describe('INBOX_ASSISTANT_MENTION', () => {
  it('equals the assistant mention the inbox composer writes', () => {
    expect(INBOX_ASSISTANT_MENTION).toBe('@Ada');
  });
});
