import { FileFolder } from 'twenty-shared/types';

import { COMPLETE_FILE_UPLOAD_DEADLINE_MS } from 'src/engine/core-modules/file/file-upload/constants/complete-file-upload-deadline.constant';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';

describe('FileUploadService.completeFileUpload', () => {
  const workspaceId = 'workspace-id';
  const fileId = 'file-id';
  const signedUrl = 'https://example.com/signed';

  const buildFile = (status: string) => ({
    id: fileId,
    path: `${FileFolder.FilesField}/field-id/file.pdf`,
    size: '12',
    status,
    settings: { isTemporaryFile: false, toDelete: false },
    applicationId: 'application-id',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  const fileRepository = { findOne: jest.fn() };
  const fileUrlService = { signFileByIdUrl: jest.fn() };
  const applicationRepository = { findOneOrFail: jest.fn() };
  const fileUploadCompletionService = { completeUploadedFile: jest.fn() };

  const service = new FileUploadService(
    {} as never,
    fileUrlService as never,
    {} as never,
    fileUploadCompletionService as never,
    {} as never,
    applicationRepository as never,
    {} as never,
    fileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fileUrlService.signFileByIdUrl.mockResolvedValue(signedUrl);
    applicationRepository.findOneOrFail.mockResolvedValue({
      universalIdentifier: 'application-universal-identifier',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the stored file on retry when the upload is already completed', async () => {
    fileRepository.findOne.mockResolvedValue(buildFile(FILE_STATUS.UPLOADED));

    const result = await service.completeFileUpload({ workspaceId, fileId });

    expect(result).toMatchObject({
      id: fileId,
      status: FILE_STATUS.UPLOADED,
      url: signedUrl,
    });
    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).not.toHaveBeenCalled();
  });

  it('should complete a pending upload and return the signed file', async () => {
    fileRepository.findOne.mockResolvedValue(buildFile(FILE_STATUS.PENDING));
    fileUploadCompletionService.completeUploadedFile.mockResolvedValue({
      id: fileId,
      path: `${FileFolder.FilesField}/field-id/file.pdf`,
      size: 12,
      mimeType: 'application/pdf',
    });

    const result = await service.completeFileUpload({ workspaceId, fileId });

    expect(result).toMatchObject({
      id: fileId,
      status: FILE_STATUS.UPLOADED,
      mimeType: 'application/pdf',
      url: signedUrl,
    });
    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        storageLocation: expect.objectContaining({
          fileFolder: FileFolder.FilesField,
          resourcePath: 'field-id/file.pdf',
        }),
      }),
    );
  });

  it('should fail with STORAGE_TIMEOUT when completion exceeds the deadline', async () => {
    jest.useFakeTimers();
    fileRepository.findOne.mockResolvedValue(buildFile(FILE_STATUS.PENDING));
    fileUploadCompletionService.completeUploadedFile.mockReturnValue(
      new Promise(() => {}),
    );

    const result = service.completeFileUpload({ workspaceId, fileId });
    const assertion = expect(result).rejects.toMatchObject({
      code: FileUploadExceptionCode.STORAGE_TIMEOUT,
    });

    await jest.advanceTimersByTimeAsync(COMPLETE_FILE_UPLOAD_DEADLINE_MS);

    await assertion;
  });
});
