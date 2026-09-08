import { beforeEach, expect, it, vi } from 'vitest';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';

const { list, create, download } = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  download: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/list-recall-transcripts.util', () => ({
  listRecallTranscripts: list,
}));
vi.mock(
  'src/logic-functions/recall-api/create-async-recall-transcript.util',
  () => ({ createAsyncRecallTranscript: create }),
);
vi.mock('src/logic-functions/flows/download-transcript.util', () => ({
  downloadTranscript: download,
}));

const run = (transcript: unknown) =>
  importCallRecordingTranscript({
    callRecordingId: 'call',
    externalRecordingId: 'recording',
    currentStatus: 'PROCESSING',
    requestedAt: '2026-09-08T10:00:00Z',
    transcript,
  });
beforeEach(() => {
  vi.resetAllMocks();
  list.mockResolvedValue({ ok: true, transcripts: [] });
  download.mockResolvedValue({ outcome: 'pending' });
});

it('uses the pending artifact rather than another listed transcript', async () => {
  list.mockResolvedValue({
    ok: true,
    transcripts: [
      { id: 'unrelated', statusCode: 'done' },
      { id: 'owned', statusCode: 'done' },
    ],
  });
  await run({ status: 'PENDING', recallTranscriptId: 'owned' });
  expect(download).toHaveBeenCalledExactlyOnceWith({ transcriptId: 'owned' });
  expect(create).not.toHaveBeenCalled();
});

it('does not repeat a paid request whose response was lost', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  create.mockResolvedValue({ ok: false, errorMessage: 'connection lost' });
  const result = await run(null);
  expect(result.updateData.transcript).toMatchObject({
    status: 'PENDING',
    recallTranscriptId: null,
  });
  await run(result.updateData.transcript);
  expect(create).toHaveBeenCalledOnce();
  vi.restoreAllMocks();
});

it('clears a confirmed deleted artifact so a later import can replace it', async () => {
  list.mockResolvedValueOnce({
    ok: true,
    transcripts: [{ id: 'deleted', statusCode: 'deleted' }],
  });
  const result = await run({
    status: 'PENDING',
    recallTranscriptId: 'deleted',
  });
  expect(result.updateData.transcript).toBeNull();
  create.mockResolvedValue({ ok: true, transcriptId: 'replacement' });
  expect(
    (await run(result.updateData.transcript)).updateData.transcript,
  ).toMatchObject({ recallTranscriptId: 'replacement' });
  expect(create).toHaveBeenCalledOnce();
});
