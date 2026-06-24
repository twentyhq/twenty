import { describe, expect, it } from 'vitest';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';

const filledTranscript = [{ participant: { id: 1 }, words: [] }];
const filledAudio = [{ fileId: 'file-audio-1', label: 'audio.mp3' }];
const filledVideo = [{ fileId: 'file-video-1', label: 'video.mp4' }];

describe('shouldCompleteCallRecordingIngestion', () => {
  it('requires complete artifacts and billable timestamps before completion', () => {
    expect(
      shouldCompleteCallRecordingIngestion({
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
      shouldCompleteCallRecordingIngestion({
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
      shouldCompleteCallRecordingIngestion({
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
      shouldCompleteCallRecordingIngestion({
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

  it('does not complete a persisted failed recording', () => {
    expect(
      shouldCompleteCallRecordingIngestion({
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
});
