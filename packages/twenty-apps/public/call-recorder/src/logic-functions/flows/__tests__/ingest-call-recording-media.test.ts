import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-megabytes-env-var-name';
import { CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON } from 'src/logic-functions/constants/call-recorder-media-too-large-failure-reason';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';

const MEGABYTE = 1024 * 1024;

const uploadFileMock = vi.hoisted(() => vi.fn());
const getRecallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    uploadFile = uploadFileMock;
  },
}));

vi.mock('src/logic-functions/recall-api/get-recall-recording.util', () => ({
  getRecallRecording: getRecallRecordingMock,
}));

const RECORDING_WITH_MEDIA = {
  id: 'recall-recording-1',
  media_shortcuts: {
    video_mixed: { download_url: 'https://media.example.com/video.mp4' },
    audio_mixed: { download_url: 'https://media.example.com/audio.mp3' },
  },
};

const buildFetchResponse = ({
  contentLengthBytes,
  contentType = 'video/mp4',
}: { contentLengthBytes?: number; contentType?: string } = {}) => ({
  ok: true,
  status: 200,
  headers: {
    get: (name: string) => {
      if (name === 'content-length') {
        return contentLengthBytes === undefined
          ? null
          : String(contentLengthBytes);
      }

      if (name === 'content-type') {
        return contentType;
      }

      return null;
    },
  },
  body: { cancel: vi.fn().mockResolvedValue(undefined) },
  arrayBuffer: async () => new ArrayBuffer(8),
});

describe('ingestCallRecordingMedia', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    uploadFileMock.mockReset();
    getRecallRecordingMock.mockReset();
    getRecallRecordingMock.mockResolvedValue({
      ok: true,
      recording: RECORDING_WITH_MEDIA,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(buildFetchResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME];
  });

  it('downloads and uploads every missing artifact', async () => {
    uploadFileMock
      .mockResolvedValueOnce({ id: 'file-video-1' })
      .mockResolvedValueOnce({ id: 'file-audio-1' });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(result.downloadedArtifactCount).toBe(2);
    expect(uploadFileMock).toHaveBeenCalledTimes(2);
  });

  it('skips artifacts already on the record', async () => {
    uploadFileMock.mockResolvedValue({ id: 'file-audio-1' });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: true,
    });

    expect(result.updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(result.downloadedArtifactCount).toBe(1);
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });

  it('does not fetch the recording when both artifacts are present', async () => {
    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: true,
    });

    expect(result.updateFields).toEqual({});
    expect(result.downloadedArtifactCount).toBe(0);
    expect(getRecallRecordingMock).not.toHaveBeenCalled();
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('omits an artifact and warns when its transfer fails', async () => {
    uploadFileMock.mockRejectedValueOnce(new Error('upload exploded'));
    uploadFileMock.mockResolvedValueOnce({ id: 'file-audio-1' });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(Object.keys(result.updateFields)).toEqual(['audio']);
    // A failed transfer still buffered the artifact, so it counts against the budget.
    expect(result.downloadedArtifactCount).toBe(2);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('upload exploded'),
    );
  });

  it('returns nothing when the recording exposes no media urls', async () => {
    getRecallRecordingMock.mockResolvedValue({
      ok: true,
      recording: { id: 'recall-recording-1' },
    });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({});
    expect(result.downloadedArtifactCount).toBe(0);
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('skips an artifact whose content-length exceeds the ceiling and records the reason', async () => {
    process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME] = '50';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          buildFetchResponse({ contentLengthBytes: 80 * MEGABYTE }),
        )
        .mockResolvedValueOnce(
          buildFetchResponse({ contentLengthBytes: 5 * MEGABYTE }),
        ),
    );
    uploadFileMock.mockResolvedValueOnce({ id: 'file-audio-1' });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    // Oversized video is skipped; audio still ingests and the skip is flagged.
    expect(result.updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON,
    });
    // Only the audio download is buffered; the skipped video does not count.
    expect(result.downloadedArtifactCount).toBe(1);
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });

  it('ingests an artifact whose content-length is within the ceiling', async () => {
    process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME] = '50';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          buildFetchResponse({ contentLengthBytes: 10 * MEGABYTE }),
        ),
    );
    uploadFileMock
      .mockResolvedValueOnce({ id: 'file-video-1' })
      .mockResolvedValueOnce({ id: 'file-audio-1' });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(result.downloadedArtifactCount).toBe(2);
    expect(uploadFileMock).toHaveBeenCalledTimes(2);
  });

  it('uploads nothing and only flags the reason when every artifact is oversized', async () => {
    process.env[CALL_RECORDER_MAX_MEDIA_MEGABYTES_ENV_VAR_NAME] = '50';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          buildFetchResponse({ contentLengthBytes: 120 * MEGABYTE }),
        ),
    );

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({
      callRecorderFailureReason: CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON,
    });
    // Both artifacts are skipped before download, so nothing counts against the budget.
    expect(result.downloadedArtifactCount).toBe(0);
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('warns and returns nothing when the recording fetch fails', async () => {
    getRecallRecordingMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'recording boom',
    });

    const result = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(result.updateFields).toEqual({});
    expect(result.downloadedArtifactCount).toBe(0);
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('recording boom'),
    );
  });
});
