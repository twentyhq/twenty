import { beforeEach, describe, expect, it, vi } from 'vitest';

import importCallRecordingMediaLogicFunction, {
  importCallRecordingMediaHandler,
} from 'src/logic-functions/import-call-recording-media';
import importCallRecordingTranscriptLogicFunction, {
  importCallRecordingTranscriptHandler,
} from 'src/logic-functions/import-call-recording-transcript';

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

const VALID_PAYLOAD = {
  callRecordingId: 'call-recording-1',
  requestedAt: '2026-01-01T14:06:00.000Z',
};

describe('handleCallRecordingArtifactsImportJob', () => {
  beforeEach(() => {
    importCallRecordingArtifactsMock.mockReset();
    importCallRecordingArtifactsMock.mockResolvedValue({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      outcome: 'call-recording-artifacts-imported',
    });
    coreApiClientMock.mockReset();
  });

  it('runs each entry point against its own artifact scope', async () => {
    await importCallRecordingTranscriptHandler(VALID_PAYLOAD);
    await importCallRecordingMediaHandler(VALID_PAYLOAD);

    expect(
      importCallRecordingArtifactsMock.mock.calls.map(([call]) => call.scope),
    ).toEqual(['transcript', 'media']);
  });

  it('is reachable only from the queue, never over HTTP', () => {
    expect(
      importCallRecordingTranscriptLogicFunction.config,
    ).not.toHaveProperty('httpRouteTriggerSettings');
    expect(importCallRecordingMediaLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
  });

  it('drops provider ids supplied by the payload instead of forwarding them', async () => {
    await importCallRecordingTranscriptHandler({
      ...VALID_PAYLOAD,
      event: 'transcript.done',
      externalBotId: 'forged-bot-id',
      externalRecordingId: 'forged-recording-id',
      transcriptId: 'forged-transcript-id',
    });

    expect(importCallRecordingArtifactsMock).toHaveBeenCalledWith(
      expect.objectContaining({ request: VALID_PAYLOAD }),
    );
  });

  it('skips a payload missing the fields needed to resolve the recording', async () => {
    const result = await importCallRecordingTranscriptHandler({
      requestedAt: '2026-01-01T14:06:00.000Z',
    });

    expect(importCallRecordingArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'unknown',
      scope: 'transcript',
      reason: 'invalid call recording artifacts import request',
    });
  });

  it('rethrows an import failure as retryable so the queue redelivers it', async () => {
    importCallRecordingArtifactsMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      importCallRecordingMediaHandler(VALID_PAYLOAD),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
