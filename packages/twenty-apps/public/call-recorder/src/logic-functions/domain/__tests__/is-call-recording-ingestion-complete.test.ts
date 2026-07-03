import { describe, expect, it } from 'vitest';

import { isCallRecordingIngestionComplete } from 'src/logic-functions/domain/is-call-recording-ingestion-complete.util';

const AUDIO_VALUE = [{ fileId: 'file-audio-1', label: 'audio.mp3' }];
const VIDEO_VALUE = [{ fileId: 'file-video-1', label: 'video.mp4' }];
const TRANSCRIPT_CONTENT = [{ participant: { id: 1 }, words: [] }];

describe('isCallRecordingIngestionComplete', () => {
  it('is complete when transcript content and both media files are present', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: AUDIO_VALUE,
        video: VIDEO_VALUE,
        callRecorderFailureReason: undefined,
      }),
    ).toBe(true);
  });

  it('is incomplete while the transcript holds a marker', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
        },
        audio: AUDIO_VALUE,
        video: VIDEO_VALUE,
        callRecorderFailureReason: undefined,
      }),
    ).toBe(false);
  });

  it('is incomplete when the transcript is unset', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: null,
        audio: AUDIO_VALUE,
        video: VIDEO_VALUE,
        callRecorderFailureReason: undefined,
      }),
    ).toBe(false);
  });

  it('is incomplete while any media field is empty', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: undefined,
        video: VIDEO_VALUE,
        callRecorderFailureReason: undefined,
      }),
    ).toBe(false);
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: AUDIO_VALUE,
        video: [],
        callRecorderFailureReason: undefined,
      }),
    ).toBe(false);
  });

  it('treats a media file skipped for size as resolved', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: AUDIO_VALUE,
        video: undefined,
        callRecorderFailureReason: 'video_file_too_large',
      }),
    ).toBe(true);
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: undefined,
        video: VIDEO_VALUE,
        callRecorderFailureReason: 'audio_file_too_large',
      }),
    ).toBe(true);
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: undefined,
        video: undefined,
        callRecorderFailureReason: 'video_file_too_large,audio_file_too_large',
      }),
    ).toBe(true);
  });

  it('does not let a size marker excuse the other missing artifact', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: undefined,
        video: VIDEO_VALUE,
        callRecorderFailureReason: 'video_file_too_large',
      }),
    ).toBe(false);
  });

  it('ignores unrelated failure reasons', () => {
    expect(
      isCallRecordingIngestionComplete({
        transcript: TRANSCRIPT_CONTENT,
        audio: AUDIO_VALUE,
        video: undefined,
        callRecorderFailureReason: 'recall_bot_not_found',
      }),
    ).toBe(false);
  });
});
