import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ingestRecallMedia } from 'src/logic-functions/utils/ingest-recall-media.util';

const uploadFileMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    uploadFile = uploadFileMock;
  },
}));

const BOT_WITH_MEDIA = {
  recordings: [
    {
      id: 'recall-recording-1',
      media_shortcuts: {
        video_mixed: {
          data: { download_url: 'https://media.example.com/video.mp4' },
        },
        audio_mixed: {
          data: { download_url: 'https://media.example.com/audio.mp3' },
        },
      },
    },
  ],
};

const buildFetchResponse = () => ({
  ok: true,
  headers: { get: () => 'video/mp4' },
  arrayBuffer: async () => new ArrayBuffer(8),
});

describe('ingestRecallMedia', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    uploadFileMock.mockReset();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(buildFetchResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('downloads and uploads every missing artifact', async () => {
    uploadFileMock
      .mockResolvedValueOnce({ id: 'file-video-1' })
      .mockResolvedValueOnce({ id: 'file-audio-1' });

    const updateFields = await ingestRecallMedia({
      callRecordingId: 'call-recording-1',
      bot: BOT_WITH_MEDIA,
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

    const updateFields = await ingestRecallMedia({
      callRecordingId: 'call-recording-1',
      bot: BOT_WITH_MEDIA,
      hasAudio: false,
      hasVideo: true,
    });

    expect(updateFields).toEqual({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
    });
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });

  it('omits an artifact and warns when its transfer fails', async () => {
    uploadFileMock.mockRejectedValueOnce(new Error('upload exploded'));
    uploadFileMock.mockResolvedValueOnce({ id: 'file-audio-1' });

    const updateFields = await ingestRecallMedia({
      callRecordingId: 'call-recording-1',
      bot: BOT_WITH_MEDIA,
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

  it('returns nothing when the bot exposes no media urls', async () => {
    const updateFields = await ingestRecallMedia({
      callRecordingId: 'call-recording-1',
      bot: { recordings: [{ id: 'recall-recording-1' }] },
      hasAudio: false,
      hasVideo: false,
    });

    expect(updateFields).toEqual({});
    expect(uploadFileMock).not.toHaveBeenCalled();
  });
});
