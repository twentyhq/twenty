import { createHmac } from 'crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recallWebhookRouteHandler } from 'src/logic-functions/recall-webhook';

const getApplicationVariableValueMock = vi.hoisted(() => vi.fn());
const handleRecallWebhookMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/utils/get-application-variable-value.util',
  () => ({
    getApplicationVariableValue: getApplicationVariableValueMock,
  }),
);

vi.mock('src/logic-functions/flows/handle-recall-webhook.util', () => ({
  handleRecallWebhook: handleRecallWebhookMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

const SECRET_BYTES = Buffer.from('entry-test-secret');
const SECRET = `whsec_${SECRET_BYTES.toString('base64')}`;

type RecallWebhookRoutePayload = Parameters<
  typeof recallWebhookRouteHandler
>[0];

const buildRoutePayload = (
  overrides: Partial<RecallWebhookRoutePayload>,
): RecallWebhookRoutePayload =>
  ({
    headers: {},
    ...overrides,
  }) as RecallWebhookRoutePayload;

const buildSignedHeaders = (rawBody: string): Record<string, string> => {
  const webhookId = 'msg_entry_test';
  const webhookTimestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', SECRET_BYTES)
    .update(`${webhookId}.${webhookTimestamp}.${rawBody}`)
    .digest('base64');

  return {
    'webhook-id': webhookId,
    'webhook-timestamp': webhookTimestamp,
    'webhook-signature': `v1,${signature}`,
  };
};

describe('recallWebhookRouteHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getApplicationVariableValueMock.mockReset();
    getApplicationVariableValueMock.mockReturnValue(SECRET);
    handleRecallWebhookMock.mockReset();
    handleRecallWebhookMock.mockResolvedValue({ status: 'updated' });
  });

  it('responds 500 when the webhook secret is not configured', async () => {
    getApplicationVariableValueMock.mockReturnValue(undefined);

    const result = await recallWebhookRouteHandler(
      buildRoutePayload({ rawBody: '{}', body: {} }),
    );

    expect(result).toMatchObject({
      __twentyHttpResponse: true,
      status: 500,
      body: {
        error: expect.stringContaining('RECALL_WEBHOOK_SECRET'),
      },
    });
  });

  it('responds 500 when the raw body is not forwarded', async () => {
    const result = await recallWebhookRouteHandler(
      buildRoutePayload({ body: {} }),
    );

    expect(result).toMatchObject({
      __twentyHttpResponse: true,
      status: 500,
      body: {
        error: expect.stringContaining('Raw request body'),
      },
    });
  });

  it('responds 401 when the signature is invalid', async () => {
    const result = await recallWebhookRouteHandler(
      buildRoutePayload({
        rawBody: '{}',
        body: {},
        headers: {
          'webhook-id': 'msg_entry_test',
          'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
          'webhook-signature': 'v1,not-a-real-signature',
        },
      }),
    );

    expect(result).toMatchObject({
      __twentyHttpResponse: true,
      status: 401,
      body: {
        error: expect.stringContaining('Invalid webhook signature'),
      },
    });
  });

  it('responds 400 when a correctly signed payload is empty', async () => {
    const rawBody = 'null';

    const result = await recallWebhookRouteHandler(
      buildRoutePayload({
        rawBody,
        body: null,
        headers: buildSignedHeaders(rawBody),
      }),
    );

    expect(result).toMatchObject({
      __twentyHttpResponse: true,
      status: 400,
      body: {
        error: 'Webhook payload was empty',
      },
    });
  });

  it('dispatches a correctly signed payload to the handler', async () => {
    const rawBody = JSON.stringify({ event: 'recording.done' });

    const result = await recallWebhookRouteHandler(
      buildRoutePayload({
        rawBody,
        body: { event: 'recording.done' },
        headers: buildSignedHeaders(rawBody),
      }),
    );

    expect(handleRecallWebhookMock).toHaveBeenCalledTimes(1);
    expect(handleRecallWebhookMock).toHaveBeenCalledWith(
      expect.objectContaining({ body: { event: 'recording.done' } }),
    );
    expect(result).toEqual({ status: 'updated' });
  });
});
