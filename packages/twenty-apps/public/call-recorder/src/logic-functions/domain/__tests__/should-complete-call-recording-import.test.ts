import { describe, expect, it } from 'vitest';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';

const filledTranscript = [{ participant: { id: 1 }, words: [] }];
const filledAudio = [{ fileId: 'file-audio-1', label: 'audio.mp3' }];
const filledVideo = [{ fileId: 'file-video-1', label: 'video.mp4' }];

describe('shouldCompleteCallRecordingImport', () => {
  it('requires complete artifacts and billable timestamps before completion', () => {
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {},
      }),
    ).toBe(true);

    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {},
      }),
    ).toBe(false);

    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
        },
      }),
    ).toBe(true);

    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          startedAt: '2026-06-10T10:00:00.000Z',
          endedAt: '2026-06-10T09:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {},
      }),
    ).toBe(false);
  });

  it('completes when a missing media file is marked too large', () => {
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
        },
        updateData: {
          callRecorderFailureReason: 'video_file_too_large',
        },
      }),
    ).toBe(true);

    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          callRecorderFailureReason: 'video_file_too_large',
        },
        updateData: {},
      }),
    ).toBe(true);
  });

  it('does not complete a persisted failed recording', () => {
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.FAILED,
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {},
      }),
    ).toBe(false);
  });

  it('does not complete when the incoming update marks the recording as failed', () => {
    expect(
      shouldCompleteCallRecordingImport({
        current: {
          status: CallRecordingStatus.PROCESSING,
          startedAt: '2026-06-10T09:00:00.000Z',
          endedAt: '2026-06-10T10:00:00.000Z',
          transcript: filledTranscript,
          audio: filledAudio,
          video: filledVideo,
        },
        updateData: {
          status: CallRecordingStatus.FAILED,
        },
      }),
    ).toBe(false);
  });
});
