import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomError } from 'src/__tests__/utils/build-fathom-error.util';
import { buildFathomRecordingDownload } from 'src/__tests__/utils/build-fathom-recording-download.util';
import { FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS } from 'src/constants/fathom.constant';

const mocks = vi.hoisted(() => ({
  getRecordingDownload: vi.fn(),
  getConnection: vi.fn(),
  resolveFathomMediaImportTarget: vi.fn(),
  applyFathomMediaDownload: vi.fn(),
  enqueueFathomMediaDownloadPoll: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
  RetryableLogicFunctionError: class RetryableLogicFunctionError extends Error {},
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock('src/logic-functions/utils/create-fathom-client.util', () => ({
  createFathomClient: () => ({
    getRecordingDownload: mocks.getRecordingDownload,
  }),
}));

vi.mock(
  'src/logic-functions/utils/resolve-fathom-media-import-target.util',
  () => ({
    resolveFathomMediaImportTarget: mocks.resolveFathomMediaImportTarget,
  }),
);

vi.mock('src/logic-functions/utils/apply-fathom-media-download.util', () => ({
  applyFathomMediaDownload: mocks.applyFathomMediaDownload,
}));

vi.mock('src/logic-functions/utils/enqueue-fathom-media-download.util', () => ({
  enqueueFathomMediaDownloadPoll: mocks.enqueueFathomMediaDownloadPoll,
}));

const { fathomImportMediaDownloadHandler } = await import(
  'src/logic-functions/fathom-import-media-download'
);

const PAYLOAD = {
  connectedAccountId: 'connection-1',
  recordingId: 123,
  callRecordingId: 'call-recording-id',
  downloadId: 'dl_1',
  attempt: 0,
};

describe('fathomImportMediaDownloadHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getConnection.mockResolvedValue({ accessToken: 'token' });
    mocks.resolveFathomMediaImportTarget.mockResolvedValue({
      status: 'proceed',
    });
    mocks.getRecordingDownload.mockResolvedValue(
      buildFathomRecordingDownload({ status: 'processing' }),
    );
  });

  it('rejects a payload without the download to poll', async () => {
    await expect(
      fathomImportMediaDownloadHandler({ ...PAYLOAD, downloadId: '' }),
    ).rejects.toThrow('valid payload');
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it('schedules the next poll while the download is still generating', async () => {
    mocks.applyFathomMediaDownload.mockResolvedValue({ outcome: 'pending' });

    const result = await fathomImportMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({ success: true, pending: true, attempt: 1 });
    expect(mocks.enqueueFathomMediaDownloadPoll).toHaveBeenCalledWith({
      ...PAYLOAD,
      attempt: 1,
    });
  });

  it('gives up once the poll budget is spent instead of queueing forever', async () => {
    mocks.applyFathomMediaDownload.mockResolvedValue({ outcome: 'pending' });

    const result = await fathomImportMediaDownloadHandler({
      ...PAYLOAD,
      attempt: FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS - 1,
    });

    expect(result).toEqual({ success: true, pending: true, exhausted: true });
    expect(mocks.enqueueFathomMediaDownloadPoll).not.toHaveBeenCalled();
  });

  it('stops polling once the media is imported', async () => {
    mocks.applyFathomMediaDownload.mockResolvedValue({
      outcome: 'imported',
      kind: 'video',
    });

    const result = await fathomImportMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({ success: true, outcome: 'imported' });
    expect(mocks.enqueueFathomMediaDownloadPoll).not.toHaveBeenCalled();
  });

  it('skips a call recording whose media arrived through another job', async () => {
    mocks.resolveFathomMediaImportTarget.mockResolvedValue({
      status: 'skipped',
      reason: 'media already imported',
    });

    const result = await fathomImportMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: 'media already imported',
    });
    expect(mocks.getRecordingDownload).not.toHaveBeenCalled();
  });

  it('hands a rate-limited poll back for redelivery', async () => {
    mocks.getRecordingDownload.mockRejectedValue(buildFathomError(429));

    await expect(
      fathomImportMediaDownloadHandler(PAYLOAD),
    ).rejects.toBeInstanceOf(Error);
    expect(mocks.enqueueFathomMediaDownloadPoll).not.toHaveBeenCalled();
  });
});
