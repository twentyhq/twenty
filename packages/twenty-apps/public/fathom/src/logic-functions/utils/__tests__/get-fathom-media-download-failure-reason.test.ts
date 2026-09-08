import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { describe, expect, it } from 'vitest';

import { getFathomMediaDownloadFailureReason } from 'src/logic-functions/utils/get-fathom-media-download-failure-reason.util';

const DOWNLOAD_FILE = {
  url: 'https://example.com/recording',
  contentType: 'video/mp4',
  fileSizeBytes: 1_024,
  expiresAt: new Date('2026-09-06T12:00:00.000Z'),
};

describe('getFathomMediaDownloadFailureReason', () => {
  it.each<{
    description: string;
    download: Pick<
      RecordingDownload,
      'status' | 'failureReason' | 'video' | 'audio'
    >;
    expectedReason: string | undefined;
  }>([
    {
      description: 'processing without files remains pending',
      download: { status: 'processing' },
      expectedReason: undefined,
    },
    {
      description: 'completed video is importable',
      download: { status: 'completed', video: DOWNLOAD_FILE },
      expectedReason: undefined,
    },
    {
      description: 'completed audio is importable',
      download: { status: 'completed', audio: DOWNLOAD_FILE },
      expectedReason: undefined,
    },
    {
      description: 'expired downloads cannot reuse an expired file',
      download: { status: 'expired', video: DOWNLOAD_FILE },
      expectedReason: 'download_expired',
    },
    {
      description: 'failed downloads retain the provider reason',
      download: { status: 'failed', failureReason: 'generation_timeout' },
      expectedReason: 'generation_timeout',
    },
    {
      description: 'failed downloads without a reason use the fallback',
      download: { status: 'failed' },
      expectedReason: 'generation_failed',
    },
    {
      description: 'completed downloads without media are unavailable',
      download: { status: 'completed' },
      expectedReason: 'completed_without_file',
    },
  ])('$description', ({ download, expectedReason }) => {
    expect(getFathomMediaDownloadFailureReason(download)).toBe(expectedReason);
  });
});
