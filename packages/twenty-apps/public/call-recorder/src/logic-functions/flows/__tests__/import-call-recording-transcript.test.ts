import { beforeEach, describe, expect, it, vi } from 'vitest';

import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';

const listRecallTranscriptsMock = vi.hoisted(() => vi.fn());
const createAsyncRecallTranscriptMock = vi.hoisted(() => vi.fn());
const downloadTranscriptMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/list-recall-transcripts.util', () => ({
  listRecallTranscripts: listRecallTranscriptsMock,
}));

vi.mock(
  'src/logic-functions/recall-api/create-async-recall-transcript.util',
  () => ({
    createAsyncRecallTranscript: createAsyncRecallTranscriptMock,
  }),
);

vi.mock('src/logic-functions/flows/download-transcript.util', () => ({
  downloadTranscript: downloadTranscriptMock,
}));

const importTranscript = () =>
  importCallRecordingTranscript({
    callRecordingId: 'call-recording-1',
    currentStatus: 'PROCESSING',
    externalRecordingId: 'recall-recording-1',
    requestedAt: '2026-01-01T14:06:00.000Z',
    transcript: null,
  });

describe('importCallRecordingTranscript', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    listRecallTranscriptsMock.mockReset();
    createAsyncRecallTranscriptMock.mockReset();
    downloadTranscriptMock.mockReset();
  });

  it('does not redeliver a permanent transcript-list failure', async () => {
    listRecallTranscriptsMock.mockResolvedValue({
      ok: false,
      status: 400,
      errorMessage: 'Recall API responded with HTTP 400',
    });

    await expect(importTranscript()).resolves.toEqual({
      updateData: {},
      requestedTranscript: false,
      hasRetryableFailure: false,
    });
    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
  });

  it('redelivers a transient transcript-list failure', async () => {
    listRecallTranscriptsMock.mockResolvedValue({
      ok: false,
      status: 503,
      errorMessage: 'Recall API responded with HTTP 503',
    });

    await expect(importTranscript()).resolves.toEqual({
      updateData: {},
      requestedTranscript: false,
      hasRetryableFailure: true,
    });
  });

  it('does not immediately repeat an ambiguous transcript creation', async () => {
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [],
    });
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'Recall API request failed: connection reset',
    });

    await expect(importTranscript()).resolves.toEqual({
      updateData: {},
      requestedTranscript: false,
      hasRetryableFailure: false,
    });
  });

  it('redelivers a transcript creation rejected with a retryable status', async () => {
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [],
    });
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: false,
      status: 503,
      errorMessage: 'Recall API responded with HTTP 503',
    });

    await expect(importTranscript()).resolves.toEqual({
      updateData: {},
      requestedTranscript: false,
      hasRetryableFailure: true,
    });
  });
});
