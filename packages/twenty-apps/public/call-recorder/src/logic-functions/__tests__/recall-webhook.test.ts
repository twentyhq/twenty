import { createHmac } from 'crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-recall-webhook-logic-function-universal-identifier';
import recallWebhookLogicFunction, {
  recallWebhookRouteHandler,
} from 'src/logic-functions/recall-webhook';

const SECRET_BYTES = Buffer.from('entry-test-secret');
const SECRET = `whsec_${SECRET_BYTES.toString('base64')}`;
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const CALL_RECORDING_ID = 'call-recording-1';

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

const buildRecordingDoneWebhookBody = () => ({
  event: 'recording.done',
  data: {
    bot: {
      id: 'recall-bot-1',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: CALL_RECORDING_ID,
      },
    },
    recording: {
      id: 'recall-recording-1',
    },
  },
});

describe('recallWebhookRouteHandler', () => {
  beforeEach(() => {
    vi.stubEnv('RECALL_WEBHOOK_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('declares a server route trigger that forwards the webhook signature headers', () => {
    expect(recallWebhookLogicFunction.success).toBe(true);
    expect(
      recallWebhookLogicFunction.config.httpRouteTriggerSettings,
    ).toBeUndefined();
    expect(
      'serverRouteTriggerSettings' in recallWebhookLogicFunction.config,
    ).toBe(true);

    if (!('serverRouteTriggerSettings' in recallWebhookLogicFunction.config)) {
      throw new Error('Expected a server route trigger');
    }

    expect(
      recallWebhookLogicFunction.config.serverRouteTriggerSettings,
    ).toEqual({
      forwardedRequestHeaders: [
        'webhook-id',
        'webhook-timestamp',
        'webhook-signature',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
      ],
    });
  });

  it('throws when the webhook secret is not configured', () => {
    vi.stubEnv('RECALL_WEBHOOK_SECRET', '');

    expect(() =>
      recallWebhookRouteHandler(buildRoutePayload({ rawBody: '{}', body: {} })),
    ).toThrow('RECALL_WEBHOOK_SECRET');
  });

  it('throws when the raw body is not forwarded', () => {
    expect(() =>
      recallWebhookRouteHandler(buildRoutePayload({ body: {} })),
    ).toThrow('Raw request body');
  });

  it('throws when the signature is invalid', () => {
    expect(() =>
      recallWebhookRouteHandler(
        buildRoutePayload({
          rawBody: '{}',
          body: {},
          headers: {
            'webhook-id': 'msg_entry_test',
            'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
            'webhook-signature': 'v1,not-a-real-signature',
          },
        }),
      ),
    ).toThrow('Invalid webhook signature');
  });

  it('throws when a correctly signed payload is empty', () => {
    const rawBody = 'null';

    expect(() =>
      recallWebhookRouteHandler(
        buildRoutePayload({
          rawBody,
          body: null,
          headers: buildSignedHeaders(rawBody),
        }),
      ),
    ).toThrow('Webhook payload was empty');
  });

  it('throws when the workspace id is missing from the bot metadata', () => {
    const body = {
      event: 'recording.done',
      data: { bot: { id: 'recall-bot-1' } },
    };
    const rawBody = JSON.stringify(body);

    expect(() =>
      recallWebhookRouteHandler(
        buildRoutePayload({
          rawBody,
          body,
          headers: buildSignedHeaders(rawBody),
        }),
      ),
    ).toThrow('workspace id');
  });

  it('resolves the target workspace for a correctly signed payload', () => {
    const body = buildRecordingDoneWebhookBody();
    const rawBody = JSON.stringify(body);

    const result = recallWebhookRouteHandler(
      buildRoutePayload({
        rawBody,
        body,
        headers: buildSignedHeaders(rawBody),
      }),
    );

    expect(result).toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier:
        PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: body,
    });
  });
});
