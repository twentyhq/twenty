import { createHmac } from 'crypto';

import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/constants/slack-test-webhook-secret.constant';

export const signSlackRequest = ({
  rawBody,
  timestampSeconds,
  secret = SLACK_TEST_WEBHOOK_SECRET,
}: {
  rawBody: string;
  timestampSeconds: number;
  secret?: string;
}): string =>
  `v0=${createHmac('sha256', secret)
    .update(`v0:${timestampSeconds}:${rawBody}`, 'utf8')
    .digest('hex')}`;
