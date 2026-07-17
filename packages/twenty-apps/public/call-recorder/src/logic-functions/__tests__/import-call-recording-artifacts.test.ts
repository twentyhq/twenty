import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import importCallRecordingArtifactsLogicFunction, {
  importCallRecordingArtifactsHandler,
} from 'src/logic-functions/import-call-recording-artifacts';
import { IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH } from 'src/constants/import-call-recording-artifacts-route-path';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';

const importCallRecordingArtifactsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/import-call-recording-artifacts.util',
  () => ({
    importCallRecordingArtifacts: importCallRecordingArtifactsMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

const buildRoutePayload = (
  body: Partial<CallRecordingArtifactsImportRequest> | null,
): RoutePayload<Partial<CallRecordingArtifactsImportRequest>> =>
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

describe('import-call-recording-artifacts', () => {
  beforeEach(() => {
    importCallRecordingArtifactsMock.mockReset();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
    coreApiClientMock.mockReset();
  });

  it('declares an authenticated own-route trigger for continuation requests', () => {
    expect(importCallRecordingArtifactsLogicFunction.success).toBe(true);
    expect(
      importCallRecordingArtifactsLogicFunction.config.httpRouteTriggerSettings,
    ).toEqual({
      path: IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH,
      httpMethod: 'POST',
      isAuthRequired: true,
    });
  });

  it('forwards a valid continuation request to the worker flow', async () => {
    const body = {
      callRecordingId: 'call-recording-1',
      requestedAt: '2026-01-01T14:06:00.000Z',
    };

    const result = await importCallRecordingArtifactsHandler(
      buildRoutePayload(body),
    );

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: body,
    });
    expect(result).toEqual({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('ignores caller-supplied provider ids instead of forwarding them', async () => {
    const result = await importCallRecordingArtifactsHandler(
      buildRoutePayload({
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
        event: 'transcript.done',
        externalBotId: 'forged-bot-id',
        externalRecordingId: 'forged-recording-id',
        transcriptId: 'forged-transcript-id',
      } as never),
    );

    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      request: {
        callRecordingId: 'call-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });
    expect(result).toEqual(expect.objectContaining({ status: 'imported' }));
  });

  it('skips invalid continuation requests without touching the worker flow', async () => {
    const result = await importCallRecordingArtifactsHandler(
      buildRoutePayload({ requestedAt: '2026-01-01T14:06:00.000Z' }),
    );

    expect(importCallRecordingArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'unknown',
      reason: 'invalid call recording artifacts import request',
    });
  });
});
