import { describe, expect, it } from 'vitest';

import { buildFailedReplyNotificationText } from 'src/logic-functions/data/build-failed-reply-notification-text.util';

describe('buildFailedReplyNotificationText', () => {
  it('names the recipient, the reason and the reply', () => {
    expect(
      buildFailedReplyNotificationText({
        recipientName: 'Ada Lovelace',
        reason: "Messenger only allows replies within 7 days of the customer's last message.",
        replyText: 'Your order shipped',
      }),
    ).toBe(
      "A Messenger reply to Ada Lovelace was not sent: Messenger only allows replies within 7 days of the customer's last message.\n\nReply: \"Your order shipped\"",
    );
  });

  it('shortens a long reply and leaves out an empty one', () => {
    const text = buildFailedReplyNotificationText({
      recipientName: 'Ada',
      reason: 'error',
      replyText: 'x'.repeat(300),
    });

    expect(text).toContain(`${'x'.repeat(200)}…`);
    expect(
      buildFailedReplyNotificationText({ recipientName: 'Ada', reason: 'error', replyText: ' ' }),
    ).toBe('A Messenger reply to Ada was not sent: error');
  });
});
