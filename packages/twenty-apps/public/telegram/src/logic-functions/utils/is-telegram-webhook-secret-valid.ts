import { createHash, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

export const isTelegramWebhookSecretValid = ({
  received,
  expected,
}: {
  received: unknown;
  expected: string;
}): boolean =>
  isNonEmptyString(received) &&
  timingSafeEqual(digest(received), digest(expected));
