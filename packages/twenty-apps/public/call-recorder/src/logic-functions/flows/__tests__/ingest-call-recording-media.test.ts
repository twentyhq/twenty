import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-max-media-file-size-mb-env-var-name';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';

const mutationMock = vi.hoisted(() => vi.fn());
const getRecallRecordingMock = vi.hoisted(() => vi.fn());
const putMediaDownloadBodyToUploadTargetMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = mutationMock;
  },
}));

vi.mock('src/logic-functions/recall-api/get-recall-recording.util', () => ({
  getRecallRecording: getRecallRecordingMock,
}));

vi.mock(
  'src/logic-functions/flows/put-media-download-body-to-upload-target.util',
  () => ({
    putMediaDownloadBodyToUploadTarget: putMediaDownloadBodyToUploadTargetMock,
  }),
);

const VIDEO_URL = 'https://media.example.com/video.mp4';
const AUDIO_URL = 'https://media.example.com/audio.mp3';

const RECORDING_WITH_MEDIA = {
  id: 'recall-recording-1',
  media_shortcuts: {
    video_mixed: { download_url: VIDEO_URL },
    audio_mixed: { download_url: AUDIO_URL },
  },
};

const uploadUrlForFilename = (filename: string) =>
  `https://storage.example.com/${filename}`;

const buildBodyStream = (chunks: Uint8Array[]): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

const buildDownloadResponse = ({
  contentLengthBytes,
  body,
}: {
  contentLengthBytes?: number;
  body?: unknown;
} = {}) => {
  const headers = new Map<string, string>();

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

const fetchMock = vi.fn();

type DirectUploadMutationRequest =
  | { createFileUpload: { __args: { filename: string } } }
  | { completeFileUpload: { __args: { fileId: string } } };

const stubFetch = ({
  downloadsByUrl,
}: {
  downloadsByUrl: Record<string, unknown>;
}) => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(
    (url: string, init?: { method?: string }) => {
      if (init?.method === 'PUT') {
        throw new Error('Upload requests should go through the upload bridge');
      }

      const downloadResponse = downloadsByUrl[url];

      if (downloadResponse === undefined) {
        throw new Error(`Unhandled fetch url in test: ${url}`);
      }

      return Promise.resolve(downloadResponse);
    },
  );

  vi.stubGlobal('fetch', fetchMock);
};

// createFileUpload returns a presigned target whose fileId echoes the filename,
// and completeFileUpload resolves that target to the final stored file id.
const stubDirectUpload = ({
  finalFileIdByFilename,
  createFileUploadErrorByFilename = {},
}: {
  finalFileIdByFilename: Record<string, string>;
  createFileUploadErrorByFilename?: Record<string, Error>;
}) => {
  mutationMock.mockImplementation((request: DirectUploadMutationRequest) => {
    if ('createFileUpload' in request) {
      const { filename } = request.createFileUpload.__args;
      const createFileUploadError = createFileUploadErrorByFilename[filename];

      if (createFileUploadError) {
        return Promise.reject(createFileUploadError);
      }

      return Promise.resolve({
        createFileUpload: {
          fileId: filename,
          uploadUrl: uploadUrlForFilename(filename),
          contentType: 'application/octet-stream',
        },
      });
    }

    if ('completeFileUpload' in request) {
      const { fileId } = request.completeFileUpload.__args;

      return Promise.resolve({
        completeFileUpload: { id: finalFileIdByFilename[fileId] },
      });
    }

    throw new Error('Unhandled mutation in test');
  });
};

const getUploadBridgeCall = (fileName: string) =>
  putMediaDownloadBodyToUploadTargetMock.mock.calls.find(
    ([uploadInput]) => uploadInput.fileName === fileName,
  );

describe('ingestCallRecordingMedia', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mutationMock.mockReset();
    getRecallRecordingMock.mockReset();
    putMediaDownloadBodyToUploadTargetMock.mockReset();
    putMediaDownloadBodyToUploadTargetMock.mockResolvedValue(undefined);
    getRecallRecordingMock.mockResolvedValue({
      ok: true,
      recording: RECORDING_WITH_MEDIA,
    });
    stubDirectUpload({
      finalFileIdByFilename: {
        'video.mp4': 'file-video-1',
        'audio.mp3': 'file-audio-1',
      },
    });
    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
        [AUDIO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('streams and uploads every missing artifact', async () => {
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
    expect(getUploadBridgeCall('video.mp4')).toMatchObject([
      expect.objectContaining({
        fileName: 'video.mp4',
        sizeBytes: 8,
        uploadTarget: expect.objectContaining({
          uploadUrl: uploadUrlForFilename('video.mp4'),
        }),
      }),
    ]);
    expect(getUploadBridgeCall('audio.mp3')).toMatchObject([
      expect.objectContaining({
        fileName: 'audio.mp3',
        sizeBytes: 8,
        uploadTarget: expect.objectContaining({
          uploadUrl: uploadUrlForFilename('audio.mp3'),
        }),
      }),
    ]);
  });

  it('declares the presigned upload with the download size, folder and field identifier', async () => {
    await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: false,
    });

    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        createFileUpload: expect.objectContaining({
          __args: {
            filename: 'video.mp4',
            size: 8,
            fileFolder: 'FilesField',
            fieldMetadataUniversalIdentifier:
              CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
          },
        }),
      }),
    );
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        completeFileUpload: expect.objectContaining({
          __args: { fileId: 'video.mp4' },
        }),
      }),
    );
  });

  it('skips artifacts already on the record', async () => {
    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: true,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(getUploadBridgeCall('video.mp4')).toBeUndefined();
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
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('cancels the opened download body when creating its upload target fails', async () => {
    const cancelMock = vi.fn().mockResolvedValue(undefined);

    stubDirectUpload({
      finalFileIdByFilename: {
        'video.mp4': 'file-video-1',
        'audio.mp3': 'file-audio-1',
      },
      createFileUploadErrorByFilename: {
        'video.mp4': new Error('upload target exploded'),
      },
    });
    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          contentLengthBytes: 8,
          body: { cancel: cancelMock },
        }),
        [AUDIO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
      },
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(getUploadBridgeCall('video.mp4')).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('upload target exploded'),
    );
  });

  it('omits an artifact and warns when the download has no content length', async () => {
    const cancelMock = vi.fn().mockRejectedValue(new Error('cancel exploded'));

    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          body: { cancel: cancelMock },
        }),
        [AUDIO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
      },
    });

    const updateFields = await ingestCallRecordingMedia({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(getUploadBridgeCall('video.mp4')).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('content-length'),
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('download-body-cancel-failed'),
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
    expect(mutationMock).not.toHaveBeenCalled();
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
    expect(mutationMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('recording boom'),
    );
  });

  it('skips an oversized file without reading its body and records the reason', async () => {
    const cancelMock = vi.fn().mockRejectedValue(new Error('cancel exploded'));

    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          contentLengthBytes: 200 * 1024 * 1024,
          body: { cancel: cancelMock },
        }),
        [AUDIO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
      },
    });

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
    expect(getUploadBridgeCall('video.mp4')).toBeUndefined();
    expect(cancelMock).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('artifact-too-large'),
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('download-body-cancel-failed'),
    );
  });

  it('records both markers when video and audio exceed the cap', async () => {
    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          contentLengthBytes: 200 * 1024 * 1024,
        }),
        [AUDIO_URL]: buildDownloadResponse({
          contentLengthBytes: 120 * 1024 * 1024,
        }),
      },
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
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('honors the cap configured through the environment', async () => {
    vi.stubEnv(CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB_ENV_VAR_NAME, '1');
    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          contentLengthBytes: 2 * 1024 * 1024,
        }),
        [AUDIO_URL]: buildDownloadResponse({ contentLengthBytes: 8 }),
      },
    });

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
    stubFetch({
      downloadsByUrl: {
        [VIDEO_URL]: buildDownloadResponse({
          contentLengthBytes: 2 * 1024 * 1024,
        }),
      },
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
});
