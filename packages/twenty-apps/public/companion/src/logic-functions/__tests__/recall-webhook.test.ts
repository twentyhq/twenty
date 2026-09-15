import { createHmac } from 'crypto';
import { expect, it, vi } from 'vitest';
import { recallWebhookRouteHandler } from 'src/logic-functions/recall-webhook';

vi.mock(
  'src/logic-functions/utils/get-application-variable-value.util',
  () => ({
    getApplicationVariableValue: () =>
      `whsec_${Buffer.from('test-secret').toString('base64')}`,
  }),
);

it('routes and dispatches only the signed bytes even when the parsed body is forged', () => {
  const signedBody = {
    event: 'recording.done',
    data: {
      recording: {
        id: 'owned-recording',
        metadata: { twentyWorkspaceId: 'workspace-1' },
      },
    },
  };
  const rawBody = JSON.stringify(signedBody);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const headers = {
    'webhook-id': 'message-1',
    'webhook-timestamp': timestamp,
    'webhook-signature': `v1,${createHmac('sha256', 'test-secret').update(`message-1.${timestamp}.${rawBody}`).digest('base64')}`,
  };
  const payload = {
    rawBody,
    headers,
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/recall-webhook' } },
    userWorkspaceId: null,
    body: {
      event: 'recording.done',
      data: {
        recording: {
          id: 'foreign-recording',
          metadata: { twentyWorkspaceId: 'foreign-workspace' },
        },
      },
    },
  } satisfies Parameters<typeof recallWebhookRouteHandler>[0];
  const result = recallWebhookRouteHandler(payload);
  expect(result.workspaceId).toBe('workspace-1');
  expect(result.payload).toEqual({ rawBody, headers });
});
