import { describe, expect, it } from 'vitest';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';

const filledTranscript = [{ participant: { id: 1 }, words: [] }];
const filledAudio = [{ fileId: 'file-audio-1', label: 'audio.mp3' }];
const filledVideo = [{ fileId: 'file-video-1', label: 'video.mp4' }];

const buildCompletableCallRecording = () => ({
  status: CallRecordingStatus.PROCESSING,
  startedAt: '2026-06-10T09:00:00.000Z',
  endedAt: '2026-06-10T10:00:00.000Z',
  transcript: filledTranscript,
  audio: filledAudio,
  video: filledVideo,
});

describe('shouldCompleteCallRecordingImport', () => {
  it('completes a recording holding every artifact and billable timestamps', () => {
    expect(
      shouldCompleteCallRecordingImport(buildCompletableCallRecording()),
    ).toBe(true);
  });

  it('does not complete without a billable duration', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        startedAt: undefined,
      }),
    ).toBe(false);

    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        startedAt: '2026-06-10T10:00:00.000Z',
        endedAt: '2026-06-10T09:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('does not complete while an artifact is still missing', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        video: undefined,
      }),
    ).toBe(false);
  });

  it('completes when a missing media file is marked too large', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        video: undefined,
        callRecorderFailureReason: 'video_file_too_large',
      }),
    ).toBe(true);
  });

  it('does not complete a failed recording', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        status: CallRecordingStatus.FAILED,
      }),
    ).toBe(false);
  });

  it('does not complete a recording classified as NOT_RECORDED', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        status: CallRecordingStatus.NOT_RECORDED,
      }),
    ).toBe(false);
  });

  it('does not complete a recording that is already completed', () => {
    expect(
      shouldCompleteCallRecordingImport({
        ...buildCompletableCallRecording(),
        status: CallRecordingStatus.COMPLETED,
      }),
    ).toBe(false);
  });
});
