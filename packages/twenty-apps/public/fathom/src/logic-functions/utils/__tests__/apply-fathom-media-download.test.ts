import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildFathomRecordingDownload,
  buildFathomRecordingDownloadFile,
} from 'src/__tests__/utils/build-fathom-recording-download.util';
import { applyFathomMediaDownload } from 'src/logic-functions/utils/apply-fathom-media-download.util';
import { importFathomMediaFile } from 'src/logic-functions/utils/import-fathom-media-file.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

vi.mock('src/logic-functions/utils/import-fathom-media-file.util', () => ({
  importFathomMediaFile: vi.fn(),
}));
vi.mock('src/logic-functions/utils/update-call-recording-media.util', () => ({
  updateCallRecordingMedia: vi.fn(),
}));

const coreApiClient = { mutation: vi.fn() };
const callRecordingId = 'call-recording-id';

describe('applyFathomMediaDownload', () => {
  beforeEach(() => {
    vi.mocked(importFathomMediaFile).mockReset();
    vi.mocked(updateCallRecordingMedia).mockReset();
  });

  it('reports a still-generating download as pending without touching storage', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({ status: 'processing' }),
    });

    expect(result).toEqual({ outcome: 'pending' });
    expect(importFathomMediaFile).not.toHaveBeenCalled();
    expect(updateCallRecordingMedia).not.toHaveBeenCalled();
  });

  it('surfaces the failure reason Fathom reports', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({
        status: 'failed',
        failureReason: 'generation_timeout',
      }),
    });

    expect(result).toEqual({
      outcome: 'unavailable',
      reason: 'generation_timeout',
    });
    expect(importFathomMediaFile).not.toHaveBeenCalled();
  });

  it('does not re-poll an expired download', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({ status: 'expired' }),
    });

    expect(result).toEqual({ outcome: 'unavailable', reason: 'expired' });
  });

  it('writes a completed video download to the video field', async () => {
    const files = [{ fileId: 'file-id', label: 'video.mp4' }];

    vi.mocked(importFathomMediaFile).mockResolvedValue({
      outcome: 'imported',
      files,
    });

    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({
        video: buildFathomRecordingDownloadFile(),
      }),
    });

    expect(result).toEqual({ outcome: 'imported', kind: 'video' });
    expect(updateCallRecordingMedia).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      fields: { video: files },
    });
  });

  it('writes an audio-only download to the audio field', async () => {
    const files = [{ fileId: 'file-id', label: 'audio.mp3' }];

    vi.mocked(importFathomMediaFile).mockResolvedValue({
      outcome: 'imported',
      files,
    });

    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({
        audio: buildFathomRecordingDownloadFile({ contentType: 'audio/mpeg' }),
      }),
    });

    expect(result).toEqual({ outcome: 'imported', kind: 'audio' });
    expect(updateCallRecordingMedia).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      fields: { audio: files },
    });
  });

  it('leaves the media fields untouched when the file exceeds the size cap', async () => {
    vi.mocked(importFathomMediaFile).mockResolvedValue({
      outcome: 'too-large',
      sizeBytes: 900_000_000,
    });

    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({
        video: buildFathomRecordingDownloadFile({ fileSizeBytes: 900_000_000 }),
      }),
    });

    expect(result).toEqual({
      outcome: 'too-large',
      kind: 'video',
      sizeBytes: 900_000_000,
    });
    expect(updateCallRecordingMedia).not.toHaveBeenCalled();
  });

  it('reports a completed download that carries no file', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload(),
    });

    expect(result).toEqual({
      outcome: 'unavailable',
      reason: 'completed without a file',
    });
    expect(importFathomMediaFile).not.toHaveBeenCalled();
  });
});
