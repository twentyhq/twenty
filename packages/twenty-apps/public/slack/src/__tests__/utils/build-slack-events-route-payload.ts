import { createHmac } from 'crypto';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const signSlackRequest = ({
  rawBody,
  timestampHeader,
  signingSecret,
}: {
  rawBody: string;
  timestampHeader: string;
  signingSecret: string;
}): string =>
  `v0=${createHmac('sha256', signingSecret)
    .update(`v0:${timestampHeader}:${rawBody}`, 'utf8')
    .digest('hex')}`;

export const buildSlackEventsRoutePayload = ({
  body,
  signingSecret,
  timestampInSeconds = Math.floor(Date.now() / 1000),
  signature,
  omitRawBody = false,
}: {
  body: SlackEventsRequestBody;
  signingSecret: string;
  timestampInSeconds?: number;
  signature?: string;
  omitRawBody?: boolean;
}): Record<string, unknown> => {
  const rawBody = JSON.stringify(body);
  const timestampHeader = String(timestampInSeconds);

  return {
    body,
    ...(omitRawBody ? {} : { rawBody }),
    headers: {
      'x-slack-signature':
        signature ?? signSlackRequest({ rawBody, timestampHeader, signingSecret }),
      'x-slack-request-timestamp': timestampHeader,
    },
  };
};
