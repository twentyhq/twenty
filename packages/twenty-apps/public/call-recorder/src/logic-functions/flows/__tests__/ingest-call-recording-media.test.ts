import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-file-size-mb-env-var-name';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';

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

const VIDEO_URL = 'https://media.example.com/video.mp4';
const AUDIO_URL = 'https://media.example.com/audio.mp3';

const RECORDING_WITH_MEDIA = {
  id: 'recall-recording-1',
  media_shortcuts: {
    video_mixed: { download_url: VIDEO_URL },
    audio_mixed: { download_url: AUDIO_URL },
  },
};

const buildBodyStream = (chunks: Uint8Array[]): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

const buildFetchResponse = ({
  contentType = 'video/mp4',
  contentLengthBytes,
  body,
}: {
  contentType?: string;
  contentLengthBytes?: number;
  body?: unknown;
} = {}) => {
  const headers = new Map<string, string>([['content-type', contentType]]);

  if (contentLengthBytes !== undefined) {
    headers.set('content-length', String(contentLengthBytes));
  }

  return {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => headers.get(name.toLowerCase()) ?? null,
    },
    body: body ?? buildBodyStream([new Uint8Array(8)]),
  };
};

const stubFetchByUrl = (responsesByUrl: Record<string, unknown>) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      const response = responsesByUrl[url];

      if (response === undefined) {
        throw new Error(`Unhandled fetch url in test: ${url}`);
      }

      return Promise.resolve(response);
    }),
  );
};

describe('ingestCallRecordingMedia', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    uploadFileMock.mockReset();
    getRecallRecordingMock.mockReset();
    getRecallRecordingMock.mockResolvedValue({
      ok: true,
      recording: RECORDING_WITH_MEDIA,
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(buildFetchResponse({ contentLengthBytes: 8 })),
        ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('downloads and uploads every missing artifact', async () => {
    uploadFileMock
      .mockResolvedValueOnce({ id: 'file-video-1' })
      .mockResolvedValueOnce({ id: 'file-audio-1' });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(uploadFileMock).toHaveBeenCalledTimes(2);
  });

  it('skips artifacts already on the record', async () => {
    uploadFileMock.mockResolvedValue({ id: 'file-audio-1' });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: true,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });

  it('does not fetch the recording when both artifacts are present', async () => {
    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: true,
    });

    expect(updateFields).toEqual({});
    expect(getRecallRecordingMock).not.toHaveBeenCalled();
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('omits an artifact and warns when its transfer fails', async () => {
    uploadFileMock.mockRejectedValueOnce(new Error('upload exploded'));
    uploadFileMock.mockResolvedValueOnce({ id: 'file-audio-1' });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(Object.keys(updateFields)).toEqual(['audio']);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('upload exploded'),
    );
  });

  it('returns nothing when the recording exposes no media urls', async () => {
    getRecallRecordingMock.mockResolvedValue({
      ok: true,
      recording: { id: 'recall-recording-1' },
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({});
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('warns and returns nothing when the recording fetch fails', async () => {
    getRecallRecordingMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'recording boom',
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({});
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('recording boom'),
    );
  });

  it('skips an oversized file without reading its body and records the reason', async () => {
    const cancelMock = vi.fn().mockResolvedValue(undefined);

    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        contentLengthBytes: 200 * 1024 * 1024,
        body: { cancel: cancelMock },
      }),
      [AUDIO_URL]: buildFetchResponse({ contentLengthBytes: 8 }),
    });
    uploadFileMock.mockResolvedValue({ id: 'file-audio-1' });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: 'video_file_too_large',
    });
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
    expect(cancelMock).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('artifact-too-large'),
    );
  });

  it('records both markers when video and audio exceed the cap', async () => {
    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        contentLengthBytes: 200 * 1024 * 1024,
      }),
      [AUDIO_URL]: buildFetchResponse({
        contentLengthBytes: 120 * 1024 * 1024,
      }),
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      callRecorderFailureReason: 'video_file_too_large,audio_file_too_large',
    });
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('honors the cap configured through the environment', async () => {
    vi.stubEnv(CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME, '1');
    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        contentLengthBytes: 2 * 1024 * 1024,
      }),
      [AUDIO_URL]: buildFetchResponse({ contentLengthBytes: 8 }),
    });
    uploadFileMock.mockResolvedValue({ id: 'file-audio-1' });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: 'video_file_too_large',
    });
  });

  it('falls back to the default cap when the configured value is invalid', async () => {
    vi.stubEnv(
      CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME,
      'not-a-number',
    );
    uploadFileMock.mockResolvedValue({ id: 'file-video-1' });
    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        contentLengthBytes: 2 * 1024 * 1024,
      }),
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
    });
  });

  it('enforces the cap while reading a response without content-length', async () => {
    vi.stubEnv(CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME, '1');
    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        body: buildBodyStream([
          new Uint8Array(700_000),
          new Uint8Array(700_000),
        ]),
      }),
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      callRecorderFailureReason: 'video_file_too_large',
    });
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('ingests a response without content-length when it stays within the cap', async () => {
    uploadFileMock.mockResolvedValue({ id: 'file-video-1' });
    stubFetchByUrl({
      [VIDEO_URL]: buildFetchResponse({
        body: buildBodyStream([new Uint8Array([1, 2, 3]), new Uint8Array([4])]),
      }),
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
    });
    expect(uploadFileMock).toHaveBeenCalledWith(
      Buffer.from([1, 2, 3, 4]),
      'video.mp4',
      'video/mp4',
      expect.any(String),
    );
  });
});
