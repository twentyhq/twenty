import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomError } from 'src/__tests__/utils/build-fathom-error.util';
import { buildFathomRecordingDownload } from 'src/__tests__/utils/build-fathom-recording-download.util';
import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';

const mocks = vi.hoisted(() => ({
  createRecordingDownload: vi.fn(),
  getConnection: vi.fn(),
  resolveFathomMediaImportTarget: vi.fn(),
  applyFathomMediaDownload: vi.fn(),
  enqueueFathomMediaDownloadPoll: vi.fn(),
  recordFathomMediaFailure: vi.fn(),
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
    createRecordingDownload: mocks.createRecordingDownload,
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

vi.mock('src/logic-functions/utils/record-fathom-media-failure.util', () => ({
  recordFathomMediaFailure: mocks.recordFathomMediaFailure,
}));

const { fathomRequestMediaDownloadHandler } = await import(
  'src/logic-functions/fathom-request-media-download'
);

const PAYLOAD = {
  connectedAccountId: 'connection-1',
  recordingId: 123,
  callRecordingId: 'call-recording-id',
};

describe('fathomRequestMediaDownloadHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getConnection.mockResolvedValue({ accessToken: 'token' });
    mocks.resolveFathomMediaImportTarget.mockResolvedValue({
      status: 'proceed',
    });
  });

  it('rejects a payload without a recording to download', async () => {
    await expect(
      fathomRequestMediaDownloadHandler({ ...PAYLOAD, recordingId: NaN }),
    ).rejects.toThrow('valid payload');
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it('skips without spending a Fathom call when media is already imported', async () => {
    mocks.resolveFathomMediaImportTarget.mockResolvedValue({
      status: 'skipped',
      reason: 'media already imported',
    });

    const result = await fathomRequestMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: 'media already imported',
    });
    expect(mocks.createRecordingDownload).not.toHaveBeenCalled();
  });

  it('imports immediately when Fathom already has the file ready', async () => {
    mocks.createRecordingDownload.mockResolvedValue(
      buildFathomRecordingDownload({ downloadId: 'dl_1' }),
    );
    mocks.applyFathomMediaDownload.mockResolvedValue({
      outcome: 'imported',
      kind: 'audio',
    });

    const result = await fathomRequestMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      downloadId: 'dl_1',
      outcome: 'imported',
    });
    expect(mocks.enqueueFathomMediaDownloadPoll).not.toHaveBeenCalled();
  });

  it('schedules the first poll while Fathom generates the video', async () => {
    mocks.createRecordingDownload.mockResolvedValue(
      buildFathomRecordingDownload({ downloadId: 'dl_2', status: 'processing' }),
    );
    mocks.applyFathomMediaDownload.mockResolvedValue({ outcome: 'pending' });

    const result = await fathomRequestMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      downloadId: 'dl_2',
      pending: true,
    });
    expect(mocks.enqueueFathomMediaDownloadPoll).toHaveBeenCalledWith({
      ...PAYLOAD,
      downloadId: 'dl_2',
      attempt: 0,
    });
  });

  it('stops without retrying when the recording has no downloadable media', async () => {
    mocks.createRecordingDownload.mockRejectedValue(
      buildFathomError(422),
    );

    const result = await fathomRequestMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: FATHOM_MEDIA_FAILURE_REASON.NO_DOWNLOADABLE_MEDIA,
    });
    expect(mocks.recordFathomMediaFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordingId: PAYLOAD.callRecordingId,
        reason: FATHOM_MEDIA_FAILURE_REASON.NO_DOWNLOADABLE_MEDIA,
      }),
    );
    expect(mocks.enqueueFathomMediaDownloadPoll).not.toHaveBeenCalled();
  });

  it('records a limited-access share so later syncs stop asking', async () => {
    mocks.createRecordingDownload.mockRejectedValue(buildFathomError(403));

    const result = await fathomRequestMediaDownloadHandler(PAYLOAD);

    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_FORBIDDEN,
    });
    expect(mocks.recordFathomMediaFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_FORBIDDEN,
      }),
    );
  });

  it('hands a rate-limited request back for redelivery', async () => {
    mocks.createRecordingDownload.mockRejectedValue(
      buildFathomError(429),
    );

    await expect(
      fathomRequestMediaDownloadHandler(PAYLOAD),
    ).rejects.toBeInstanceOf(Error);
    expect(mocks.recordFathomMediaFailure).not.toHaveBeenCalled();
  });
});
