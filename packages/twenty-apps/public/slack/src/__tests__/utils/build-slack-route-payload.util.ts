import { createHmac } from 'crypto';

import { type RoutePayload } from 'twenty-sdk/define';

import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/constants/slack-test-webhook-secret.constant';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

const signSlackRequest = ({
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

export const buildSlackRoutePayload = (
  body: SlackEventsRequestBody,
  {
    secret,
    timestampSeconds = Math.floor(Date.now() / 1000),
    signature,
    rawBody,
  }: {
    secret?: string;
    timestampSeconds?: number;
    signature?: string;
    rawBody?: string;
  } = {},
): RoutePayload<SlackEventsRequestBody> => {
  const serializedBody = rawBody ?? JSON.stringify(body);

  return {
    headers: {
      'x-slack-signature':
        signature ??
        signSlackRequest({
          rawBody: serializedBody,
          timestampSeconds,
          secret,
        }),
      'x-slack-request-timestamp': String(timestampSeconds),
    },
    queryStringParameters: {},
    pathParameters: {},
    body,
    rawBody: serializedBody,
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/slack/events' } },
    userWorkspaceId: null,
  };
};
