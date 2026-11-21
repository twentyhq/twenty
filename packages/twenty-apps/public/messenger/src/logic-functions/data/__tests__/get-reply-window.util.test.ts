import { describe, expect, it } from 'vitest';

import { getReplyWindow } from 'src/logic-functions/data/get-reply-window.util';

const NOW = new Date('2026-11-21T12:00:00Z');
const hoursAgo = (hours: number) =>
  new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();

describe('getReplyWindow', () => {
  it('is open within 24 hours of the last customer message', () => {
    expect(
      getReplyWindow(
        [
          { sentAt: hoursAgo(30), direction: 'INCOMING', text: 'Hi', status: null },
          { sentAt: hoursAgo(2), direction: 'INCOMING', text: 'Any news?', status: null },
          { sentAt: hoursAgo(1), direction: 'OUTGOING', text: 'Soon', status: 'READ' },
        ],
        NOW,
      ),
    ).toBe('OPEN');
  });

  it('is human only from 24 hours to 7 days, ignoring later Page messages', () => {
    expect(
      getReplyWindow(
        [
          { sentAt: hoursAgo(48), direction: 'INCOMING', text: 'Hi', status: null },
          { sentAt: hoursAgo(1), direction: 'OUTGOING', text: 'Hello', status: null },
        ],
        NOW,
      ),
    ).toBe('HUMAN_ONLY');
  });

  it('is closed after 7 days or without a customer message', () => {
    expect(
      getReplyWindow(
        [{ sentAt: hoursAgo(200), direction: 'INCOMING', text: 'Hi', status: null }],
        NOW,
      ),
    ).toBe('CLOSED');
    expect(getReplyWindow([], NOW)).toBe('CLOSED');
  });
});
