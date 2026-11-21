import { describe, expect, it } from 'vitest';

import { buildParseMessagePayloads } from 'src/logic-functions/data/build-parse-message-payloads.util';

describe('buildParseMessagePayloads', () => {
  it('returns one payload per message across entries, oldest first', () => {
    const payloads = buildParseMessagePayloads({
      object: 'page',
      entry: [
        {
          id: 'page-1',
          time: 3,
          messaging: [
            {
              sender: { id: 'customer-1' },
              recipient: { id: 'page-1' },
              timestamp: 300,
              message: { mid: 'm-3', text: 'third' },
            },
          ],
        },
        {
          id: 'page-2',
          time: 1,
          messaging: [
            {
              sender: { id: 'page-2' },
              recipient: { id: 'customer-2' },
              timestamp: 100,
              message: { mid: 'm-1', text: 'echo', is_echo: true },
            },
          ],
        },
      ],
    });

    expect(payloads.map(({ pageId, event }) => [pageId, event.message.mid])).toEqual([
      ['page-2', 'm-1'],
      ['page-1', 'm-3'],
    ]);
  });

  it('skips events without a message, such as read receipts', () => {
    expect(
      buildParseMessagePayloads({
        object: 'page',
        entry: [
          {
            id: 'page-1',
            time: 1,
            messaging: [
              {
                sender: { id: 'customer-1' },
                recipient: { id: 'page-1' },
                timestamp: 100,
              },
            ],
          },
        ],
      }),
    ).toEqual([]);
  });

  it('handles a webhook without entries', () => {
    expect(buildParseMessagePayloads({ object: 'page' })).toEqual([]);
  });
});
