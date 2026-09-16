import { describe, expect, it } from 'vitest';

import { extractRecallMediaArtifacts } from 'src/logic-functions/recall-api/extract-recall-media-artifacts.util';

describe('extractRecallMediaArtifacts', () => {
  it('reads download urls and artifact statuses flat from the v1.11 media shortcuts', () => {
    expect(
      extractRecallMediaArtifacts({
        id: 'recall-recording-1',
        expires_at: '2026-09-14T14:09:46.365456Z',
        media_shortcuts: {
          video_mixed: {
            download_url: 'https://media.example.com/video.mp4',
            status: { code: 'done' },
          },
          audio_mixed: {
            download_url: 'https://media.example.com/audio.mp3',
            status: { code: 'done' },
          },
        },
      }),
    ).toEqual({
      video: {
        downloadUrl: 'https://media.example.com/video.mp4',
        statusCode: 'done',
      },
      audio: {
        downloadUrl: 'https://media.example.com/audio.mp3',
        statusCode: 'done',
      },
    });
  });

  it('falls back to the nested data.download_url shape', () => {
    expect(
      extractRecallMediaArtifacts({
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
      video: {
        downloadUrl: 'https://media.example.com/video.mp4',
        statusCode: undefined,
      },
      audio: {
        downloadUrl: 'https://media.example.com/audio.mp3',
        statusCode: undefined,
      },
    });
  });

  it('reports a deleted artifact that carries no download url', () => {
    expect(
      extractRecallMediaArtifacts({
        id: 'recall-recording-1',
        media_shortcuts: {
          video_mixed: { status: { code: 'deleted' } },
          audio_mixed: { status: { code: 'deleted' } },
        },
      }),
    ).toEqual({
      video: { downloadUrl: undefined, statusCode: 'deleted' },
      audio: { downloadUrl: undefined, statusCode: 'deleted' },
    });
  });

  it('returns undefined fields when artifacts are absent', () => {
    expect(
      extractRecallMediaArtifacts({
        id: 'recall-recording-1',
        media_shortcuts: {
          video_mixed: {},
        },
      }),
    ).toEqual({
      video: { downloadUrl: undefined, statusCode: undefined },
      audio: { downloadUrl: undefined, statusCode: undefined },
    });
  });

  it('tolerates malformed recording payloads', () => {
    const emptyArtifacts = {
      video: { downloadUrl: undefined, statusCode: undefined },
      audio: { downloadUrl: undefined, statusCode: undefined },
    };

    expect(extractRecallMediaArtifacts({})).toEqual(emptyArtifacts);
    expect(
      extractRecallMediaArtifacts({ media_shortcuts: 'not-a-record' }),
    ).toEqual(emptyArtifacts);
  });
});
