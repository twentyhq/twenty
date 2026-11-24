import { describe, expect, it } from 'vitest';

import { isTelegramWebhookSecretValid } from 'src/logic-functions/utils/is-telegram-webhook-secret-valid';

describe('isTelegramWebhookSecretValid', () => {
  it('accepts the expected secret', () => {
    expect(
      isTelegramWebhookSecretValid({ received: 'secret', expected: 'secret' }),
    ).toBe(true);
  });

  it.each(['other', 'secret-longer', '', undefined, ['secret']])(
    'rejects %j',
    (received) => {
      expect(
        isTelegramWebhookSecretValid({ received, expected: 'secret' }),
      ).toBe(false);
    },
  );
});
