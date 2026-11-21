import { describe, expect, it } from 'vitest';

import { isHandledLineEvent } from 'src/logic-functions/data/is-handled-line-event.util';
import { type LineWebhookEvent } from 'src/logic-functions/types/line-webhook.type';

const BASE_EVENT = {
  webhookEventId: '01HXYZ',
  timestamp: 1_700_000_000_000,
  mode: 'active',
  deliveryContext: { isRedelivery: false },
} as const;

describe('isHandledLineEvent', () => {
  it('handles messages and unsends in one-on-one chats', () => {
    const events: LineWebhookEvent[] = [
      {
        ...BASE_EVENT,
        type: 'message',
        source: { type: 'user', userId: 'U1' },
        message: { id: '1', type: 'text', text: 'Hi' },
      },
      {
        ...BASE_EVENT,
        type: 'unsend',
        source: { type: 'user', userId: 'U1' },
        unsend: { messageId: '1' },
      },
    ];

    expect(events.every(isHandledLineEvent)).toBe(true);
  });

  it('skips group chats and other event types', () => {
    const events: LineWebhookEvent[] = [
      {
        ...BASE_EVENT,
        type: 'message',
        source: { type: 'group', groupId: 'C1', userId: 'U1' },
        message: { id: '1', type: 'text', text: 'Hi' },
      },
      { ...BASE_EVENT, type: 'follow', source: { type: 'user', userId: 'U1' } },
    ];

    expect(events.some(isHandledLineEvent)).toBe(false);
  });

  it('skips message types LINE added after this app was written', () => {
    // parsed from JSON, as webhook bodies are, since the type has no such message
    const events: LineWebhookEvent[] = JSON.parse(
      JSON.stringify([
        {
          ...BASE_EVENT,
          type: 'message',
          source: { type: 'user', userId: 'U1' },
          message: { id: '1', type: 'hologram' },
        },
      ]),
    );

    expect(events.some(isHandledLineEvent)).toBe(false);
  });
});
