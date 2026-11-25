import { describe, expect, it } from 'vitest';
import { findLatestIncomingWhatsAppMessageTime } from 'src/logic-functions/data/find-latest-incoming-whatsapp-message-time.util';

describe('findLatestIncomingWhatsAppMessageTime', () => {
  it('should ignore messages sent by the business', () => {
    expect(
      findLatestIncomingWhatsAppMessageTime([
        { sentAt: '2026-11-19T10:00:00.000Z', direction: 'INCOMING', text: 'Hi', status: null },
        { sentAt: '2026-11-20T10:00:00.000Z', direction: 'OUTGOING', text: 'Hello', status: 'READ' },
      ])?.toISOString(),
    ).toBe('2026-11-19T10:00:00.000Z');
  });

  it('should find nothing when the customer never wrote', () => {
    expect(
      findLatestIncomingWhatsAppMessageTime([
        { sentAt: '2026-11-20T10:00:00.000Z', direction: 'OUTGOING', text: 'Hello', status: 'SENT' },
      ]),
    ).toBeUndefined();
  });
});
