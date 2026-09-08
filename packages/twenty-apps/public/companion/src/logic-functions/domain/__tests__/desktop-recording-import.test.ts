import { describe, expect, it } from 'vitest';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { parseRecallWebhookEvent } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/domain/is-recall-recording-done-signal.util';

const recording = {
  status: 'PROCESSING',
  startedAt: '2026-09-07T12:00:00Z',
  endedAt: '2026-09-07T12:05:00Z',
  transcript: [{ participant: { id: 1 }, words: [] }],
  audio: [{ fileId: 'audio-1', label: 'audio.mp3' }],
};
describe('desktop import compatibility', () => {
  it('completes audio-only desktop recordings while still requiring bot video', () => {
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          ...recording,
          companionSession: { source: 'desktop', media: 'audio' },
        },
        updateData: {},
      }),
    ).toBe(true);
    expect(
      shouldCompleteCallRecordingImport({ current: recording, updateData: {} }),
    ).toBe(false);
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          ...recording,
          audio: [],
          companionSession: { source: 'desktop', media: 'audio' },
        },
        updateData: {},
      }),
    ).toBe(false);
  });
  it('routes desktop completion using upload metadata when recording metadata is empty', () => {
    const event = parseRecallWebhookEvent({
      event: 'sdk_upload.complete',
      data: {
        data: { code: 'complete', updated_at: '2026-09-07T12:05:00.123456Z' },
        sdk_upload: {
          id: 'upload-1',
          metadata: { twentyCallRecordingId: 'recording-1' },
        },
        recording: { id: 'recall-recording-1', metadata: {} },
      },
    });
    expect(event).toMatchObject({
      callRecordingIdFromMetadata: 'recording-1',
      externalRecordingId: 'recall-recording-1',
      statusTimestamp: '2026-09-07T12:05:00.123Z',
    });
    expect(
      isRecallRecordingDoneSignal({
        event: event?.event ?? '',
        statusCode: event?.statusCode,
      }),
    ).toBe(true);
  });
});
