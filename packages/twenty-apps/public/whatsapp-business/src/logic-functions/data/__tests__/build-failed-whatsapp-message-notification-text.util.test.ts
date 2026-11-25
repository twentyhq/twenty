import { describe, expect, it } from 'vitest';
import { buildFailedWhatsAppMessageNotificationText } from 'src/logic-functions/data/build-failed-whatsapp-message-notification-text.util';

describe('buildFailedWhatsAppMessageNotificationText', () => {
  it('should name the recipient, the reason and the message', () => {
    expect(
      buildFailedWhatsAppMessageNotificationText({
        recipient: '16505551234',
        statusError: '131047: Message failed to send because more than 24 hours have passed',
        messageText: 'Hello',
      }),
    ).toBe('Not delivered to 16505551234: 131047: Message failed to send because more than 24 hours have passed\n\n"Hello"');
  });

  it('should shorten a long message', () => {
    const text = buildFailedWhatsAppMessageNotificationText({
      recipient: 'US.1',
      statusError: null,
      messageText: 'a'.repeat(200),
    });

    expect(text).toBe(`Not delivered to US.1\n\n"${'a'.repeat(120)}…"`);
  });
});
