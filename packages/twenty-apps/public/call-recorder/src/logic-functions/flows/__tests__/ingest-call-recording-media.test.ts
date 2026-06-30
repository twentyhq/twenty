import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ingestCallRecordingMedia,
  ingestCallRecordingVideo,
} from 'src/logic-functions/flows/ingest-call-recording-media.util';

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

const buildFetchResponse = () => ({
  ok: true,
  headers: {
    get: (headerName: string) =>
      headerName === 'content-length' ? '8' : 'video/mp4',
  },
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

  it('skips a focused video artifact when the download is too large for the buffered path', async () => {
    const arrayBufferMock = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: {
          get: (headerName: string) =>
            headerName === 'content-length'
              ? String(101 * 1024 * 1024)
              : 'video/mp4',
        },
        arrayBuffer: arrayBufferMock,
      }),
    );

    const result = await ingestCallRecordingVideo({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasVideo: false,
    });

    expect(result).toEqual({ outcome: 'too-large' });
    expect(arrayBufferMock).not.toHaveBeenCalled();
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('buffered upload limit'),
    );
  });

  it('skips a focused video artifact when content length is unavailable', async () => {
    const arrayBufferMock = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: (headerName: string) =>
            headerName === 'content-length' ? null : 'video/mp4',
        },
        arrayBuffer: arrayBufferMock,
      }),
    );

    const result = await ingestCallRecordingVideo({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasVideo: false,
    });

    expect(result).toEqual({ outcome: 'size-unavailable' });
    expect(arrayBufferMock).not.toHaveBeenCalled();
    expect(uploadFileMock).not.toHaveBeenCalled();
  });
});
