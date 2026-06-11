import { describe, expect, it } from 'vitest';

import { extractRecallMediaUrls } from 'src/logic-functions/utils/extract-recall-media-urls.util';

describe('extractRecallMediaUrls', () => {
  it('reads both download urls from the first recording media shortcuts', () => {
    expect(
      extractRecallMediaUrls({
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
      }),
    ).toEqual({
      videoUrl: 'https://media.example.com/video.mp4',
      audioUrl: 'https://media.example.com/audio.mp3',
    });
  });

  it('returns undefined urls when artifacts are absent', () => {
    expect(
      extractRecallMediaUrls({
        recordings: [
          {
            id: 'recall-recording-1',
            media_shortcuts: {
              video_mixed: { data: {} },
            },
          },
        ],
      }),
    ).toEqual({ videoUrl: undefined, audioUrl: undefined });
  });

  it('tolerates malformed bot payloads', () => {
    expect(extractRecallMediaUrls({})).toEqual({
      videoUrl: undefined,
      audioUrl: undefined,
    });
    expect(extractRecallMediaUrls({ recordings: 'not-an-array' })).toEqual({
      videoUrl: undefined,
      audioUrl: undefined,
    });
    expect(extractRecallMediaUrls({ recordings: [null] })).toEqual({
      videoUrl: undefined,
      audioUrl: undefined,
    });
  });
});
