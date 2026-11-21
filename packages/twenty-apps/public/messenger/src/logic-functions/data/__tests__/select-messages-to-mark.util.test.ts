import { describe, expect, it } from 'vitest';

import { selectMessagesToMark } from 'src/logic-functions/data/select-messages-to-mark.util';

const WATERMARK = new Date('2026-11-21T10:00:00Z').getTime();

const MESSAGES = [
  { id: 'before', externalId: 'm-1', receivedAt: '2026-11-21T09:59:00Z', messengerStatus: null },
  { id: 'at', externalId: 'm-2', receivedAt: '2026-11-21T10:00:00Z', messengerStatus: null },
  { id: 'after', externalId: 'm-3', receivedAt: '2026-11-21T10:01:00Z', messengerStatus: null },
  { id: 'already-read', externalId: 'm-4', receivedAt: '2026-11-21T09:00:00Z', messengerStatus: 'READ' },
];

describe('selectMessagesToMark', () => {
  it('marks messages sent at or before the watermark', () => {
    expect(
      selectMessagesToMark({ messages: MESSAGES, status: 'READ', watermark: WATERMARK }).map(
        ({ id }) => id,
      ),
    ).toEqual(['before', 'at']);
  });

  it('also marks the mids a delivery receipt lists', () => {
    expect(
      selectMessagesToMark({
        messages: MESSAGES,
        status: 'DELIVERED',
        watermark: WATERMARK,
        mids: ['m-3'],
      }).map(({ id }) => id),
    ).toEqual(['before', 'at', 'after']);
  });

  it('never moves a read message back to delivered', () => {
    expect(
      selectMessagesToMark({
        messages: MESSAGES,
        status: 'DELIVERED',
        watermark: WATERMARK,
      }).map(({ id }) => id),
    ).not.toContain('already-read');
  });
});
