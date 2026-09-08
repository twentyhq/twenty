import { describe, expect, it } from 'vitest';

import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';

describe('extractRecallMediaUrls', () => {
  it('reads both download urls flat from the v1.11 media shortcuts', () => {
    expect(
      extractRecallMediaUrls({
        id: 'recall-recording-1',
        media_shortcuts: {
          video_mixed: {
            download_url: 'https://media.example.com/video.mp4',
          },
          audio_mixed: {
            download_url: 'https://media.example.com/audio.mp3',
          },
        },
      }),
    ).toEqual({
      videoUrl: 'https://media.example.com/video.mp4',
      audioUrl: 'https://media.example.com/audio.mp3',
    });
  });

  it('falls back to the nested data.download_url shape', () => {
    expect(
      extractRecallMediaUrls({
        id: 'recall-recording-1',
        media_shortcuts: {
          video_mixed: {
            data: { download_url: 'https://media.example.com/video.mp4' },
          },
          audio_mixed: {
            data: { download_url: 'https://media.example.com/audio.mp3' },
          },
        },
      }),
    ).toEqual({
      videoUrl: 'https://media.example.com/video.mp4',
      audioUrl: 'https://media.example.com/audio.mp3',
    });
  });

  it('returns undefined urls when artifacts are absent', () => {
    expect(
      extractRecallMediaUrls({
        id: 'recall-recording-1',
        media_shortcuts: {
          video_mixed: {},
        },
      }),
    ).toEqual({ videoUrl: undefined, audioUrl: undefined });
  });

  it('tolerates malformed recording payloads', () => {
    expect(extractRecallMediaUrls({})).toEqual({
      videoUrl: undefined,
      audioUrl: undefined,
    });
    expect(extractRecallMediaUrls({ media_shortcuts: 'not-a-record' })).toEqual(
      {
        videoUrl: undefined,
        audioUrl: undefined,
      },
    );
  });
});
