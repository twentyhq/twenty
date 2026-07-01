import { describe, expect, it } from 'vitest';

import { CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON } from 'src/logic-functions/constants/call-recorder-media-too-large-failure-reason';
import { mergeMediaIngestionUpdate } from 'src/logic-functions/flows/merge-media-ingestion-update.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

describe('mergeMediaIngestionUpdate', () => {
  it('copies ingested audio and video onto the target', () => {
    const target: CallRecordingUpdateFields = {};

    mergeMediaIngestionUpdate(target, {
      audio: [{ fileId: 'audio-file', label: 'audio.mp3' }],
      video: [{ fileId: 'video-file', label: 'video.mp4' }],
    });

    expect(target).toEqual({
      audio: [{ fileId: 'audio-file', label: 'audio.mp3' }],
      video: [{ fileId: 'video-file', label: 'video.mp4' }],
    });
  });

  it('writes the skip reason when the target has none', () => {
    const target: CallRecordingUpdateFields = {};

    mergeMediaIngestionUpdate(target, {
      callRecorderFailureReason: CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON,
    });

    expect(target.callRecorderFailureReason).toBe(
      CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON,
    );
  });

  it('never overwrites a more specific failure reason already on the target', () => {
    const target: CallRecordingUpdateFields = {
      callRecorderFailureReason: 'transcript_failed',
    };

    mergeMediaIngestionUpdate(target, {
      video: [{ fileId: 'video-file', label: 'video.mp4' }],
      callRecorderFailureReason: CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON,
    });

    expect(target.callRecorderFailureReason).toBe('transcript_failed');
    expect(target.video).toEqual([{ fileId: 'video-file', label: 'video.mp4' }]);
  });
});
