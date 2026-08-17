import { type RoutePayload } from 'twenty-sdk/define';

import { signSlackRequest } from 'src/__tests__/utils/sign-slack-request.util';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

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
