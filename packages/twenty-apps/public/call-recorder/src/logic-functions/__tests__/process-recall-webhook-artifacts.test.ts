import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import processRecallWebhookArtifactsLogicFunction, {
  processRecallWebhookArtifactsHandler,
} from 'src/logic-functions/process-recall-webhook-artifacts';
import { PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH } from 'src/constants/process-recall-webhook-artifacts-route-path';
import { type RecallWebhookArtifactContinuationRequest } from 'src/logic-functions/types/recall-webhook-artifact-continuation-request.type';

const processRecallWebhookArtifactsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/process-recall-webhook-artifacts.util',
  () => ({
    processRecallWebhookArtifacts: processRecallWebhookArtifactsMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

const buildRoutePayload = (
  body: Partial<RecallWebhookArtifactContinuationRequest> | null,
): RoutePayload<Partial<RecallWebhookArtifactContinuationRequest>> =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    rawBody: undefined,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  }) as never;

describe('process-recall-webhook-artifacts', () => {
  beforeEach(() => {
    processRecallWebhookArtifactsMock.mockReset();
    processRecallWebhookArtifactsMock.mockResolvedValue({
      status: 'processed',
      callRecordingId: 'call-recording-1',
      outcome: 'recording-artifacts-reconciled',
    });
    coreApiClientMock.mockReset();
  });

  it('declares an authenticated own-route trigger for continuation requests', () => {
    expect(processRecallWebhookArtifactsLogicFunction.success).toBe(true);
    expect(
      processRecallWebhookArtifactsLogicFunction.config
        .httpRouteTriggerSettings,
    ).toEqual({
      path: PROCESS_RECALL_WEBHOOK_ARTIFACTS_ROUTE_PATH,
      httpMethod: 'POST',
      isAuthRequired: true,
    });
  });

  it('forwards a valid continuation request to the worker flow', async () => {
    const body = {
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T14:06:00.000Z',
    };

    const result = await processRecallWebhookArtifactsHandler(
      buildRoutePayload(body),
    );

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(processRecallWebhookArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: body,
    });
    expect(result).toEqual({
      status: 'processed',
      callRecordingId: 'call-recording-1',
      outcome: 'recording-artifacts-reconciled',
    });
  });

  it('ignores caller-supplied provider ids instead of forwarding them', async () => {
    const result = await processRecallWebhookArtifactsHandler(
      buildRoutePayload({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
        event: 'transcript.done',
        externalBotId: 'forged-bot-id',
        externalRecordingId: 'forged-recording-id',
        transcriptId: 'forged-transcript-id',
      } as never),
    );

    expect(processRecallWebhookArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: {
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });
    expect(result).toEqual(expect.objectContaining({ status: 'processed' }));
  });

  it('skips invalid continuation requests without touching the worker flow', async () => {
    const result = await processRecallWebhookArtifactsHandler(
      buildRoutePayload({ requestedAt: '2026-01-01T14:06:00.000Z' }),
    );

    expect(processRecallWebhookArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'unknown',
      reason: 'invalid artifact continuation request',
    });
  });
});
