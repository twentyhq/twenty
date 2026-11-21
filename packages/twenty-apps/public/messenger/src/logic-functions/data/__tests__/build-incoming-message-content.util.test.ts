import { describe, expect, it } from 'vitest';

import { buildIncomingMessageContent } from 'src/logic-functions/data/build-incoming-message-content.util';

describe('buildIncomingMessageContent', () => {
  it('keeps files and stickers as attachments to download', () => {
    expect(
      buildIncomingMessageContent({
        mid: 'm-1',
        text: 'Here is the invoice',
        attachments: [
          { type: 'file', payload: { url: 'https://cdn.fbsbx.com/invoice.pdf' } },
          { type: 'sticker', payload: { url: 'https://scontent.xx.fbcdn.net/like.png', sticker_id: 369239263222822 } },
        ],
      }),
    ).toEqual({
      text: 'Here is the invoice',
      fileAttachments: [
        { url: 'https://cdn.fbsbx.com/invoice.pdf', type: 'file', index: 0 },
        { url: 'https://scontent.xx.fbcdn.net/like.png', type: 'sticker', index: 1 },
      ],
    });
  });

  it('describes shared posts and reels as text instead of downloading them', () => {
    expect(
      buildIncomingMessageContent({
        mid: 'm-1',
        attachments: [
          { type: 'reel', payload: { title: 'Spring collection', url: 'https://www.facebook.com/reel/1' } },
          { type: 'fallback' },
        ],
      }),
    ).toEqual({
      text: '[Shared reel] Spring collection https://www.facebook.com/reel/1\n[Shared link]',
      fileAttachments: [],
    });
  });

  it('names content Twenty cannot show', () => {
    expect(
      buildIncomingMessageContent({
        mid: 'm-1',
        attachments: [{ type: 'appointment_booking' }],
      }).text,
    ).toBe('[Messenger content not supported in Twenty: appointment_booking]');
  });
});
