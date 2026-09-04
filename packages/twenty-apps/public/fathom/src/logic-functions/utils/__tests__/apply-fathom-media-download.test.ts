import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildFathomRecordingDownload,
  buildFathomRecordingDownloadFile,
} from 'src/__tests__/utils/build-fathom-recording-download.util';
import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import { applyFathomMediaDownload } from 'src/logic-functions/utils/apply-fathom-media-download.util';
import { importFathomMediaFile } from 'src/logic-functions/utils/import-fathom-media-file.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { settleCallRecordingMedia } from 'src/logic-functions/utils/settle-call-recording-media.util';

vi.mock('src/logic-functions/utils/import-fathom-media-file.util', () => ({
  importFathomMediaFile: vi.fn(),
}));
vi.mock('src/logic-functions/utils/settle-call-recording-media.util', () => ({
  settleCallRecordingMedia: vi.fn(),
}));
vi.mock('src/logic-functions/utils/record-fathom-media-failure.util', () => ({
  recordFathomMediaFailure: vi.fn(),
}));

const coreApiClient = { query: vi.fn(), mutation: vi.fn() };
const callRecordingId = 'call-recording-id';

describe('applyFathomMediaDownload', () => {
  beforeEach(() => {
    vi.mocked(importFathomMediaFile).mockReset();
    vi.mocked(settleCallRecordingMedia).mockReset();
    vi.mocked(recordFathomMediaFailure).mockReset();
  });

  it('reports a still-generating download as pending without touching storage', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload({ status: 'processing' }),
    });

    expect(result).toEqual({ outcome: 'pending' });
    expect(importFathomMediaFile).not.toHaveBeenCalled();
    expect(settleCallRecordingMedia).not.toHaveBeenCalled();
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
    expect(recordFathomMediaFailure).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
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

    expect(result).toEqual({
      outcome: 'unavailable',
      reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_EXPIRED,
    });
    expect(recordFathomMediaFailure).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_EXPIRED,
    });
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
    expect(settleCallRecordingMedia).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      fields: { video: files, fathomMediaFailureReason: null },
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
    expect(settleCallRecordingMedia).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      fields: { audio: files, fathomMediaFailureReason: null },
    });
  });

  it('settles a file above the size cap without writing the media fields', async () => {
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
      outcome: 'unavailable',
      reason: FATHOM_MEDIA_FAILURE_REASON.FILE_TOO_LARGE,
    });
    expect(recordFathomMediaFailure).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.FILE_TOO_LARGE,
    });
    expect(settleCallRecordingMedia).not.toHaveBeenCalled();
  });

  it('reports a completed download that carries no file', async () => {
    const result = await applyFathomMediaDownload({
      coreApiClient,
      callRecordingId,
      download: buildFathomRecordingDownload(),
    });

    expect(result).toEqual({
      outcome: 'unavailable',
      reason: FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE,
    });
    expect(recordFathomMediaFailure).toHaveBeenCalledWith({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE,
    });
    expect(importFathomMediaFile).not.toHaveBeenCalled();
  });
});
