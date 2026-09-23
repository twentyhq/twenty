import { FileFolder } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('FileUploadService.completeFileUpload', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const fileId = '20202020-0000-4000-8000-000000000002';

  const initiator: FileUploadPrincipal = {
    applicationId: 'application-a',
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };

  let fileRepository: jest.Mocked<WorkspaceScopedRepository<FileEntity>>;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;
  let fileUploadCompletionService: jest.Mocked<FileUploadCompletionService>;
  let fileUrlService: jest.Mocked<FileUrlService>;

  const buildPendingFile = (overrides: Partial<FileEntity> = {}) =>
    ({
      id: fileId,
      workspaceId,
      applicationId: 'field-owner-application',
      path: `${FileFolder.FilesField}/field-universal-identifier/${fileId}.pdf`,
      size: 10,
      status: FILE_STATUS.PENDING,
      mimeType: 'application/octet-stream',
      settings: {
        isTemporaryFile: true,
        toDelete: false,
        uploadPrincipal: initiator,
      },
      createdAt: new Date(),
      ...overrides,
    }) as FileEntity;

  const buildService = () =>
    new FileUploadService(
      {} as never,
      fileUrlService,
      {} as never,
      fileUploadCompletionService,
      {} as never,
      applicationRepository,
      {} as never,
      fileRepository,
      {} as never,
    );

  const completeUpload = (principal: FileUploadPrincipal) =>
    buildService().completeFileUpload({ workspaceId, fileId, principal });

  beforeEach(() => {
    fileRepository = {
      findOne: jest.fn().mockResolvedValue(buildPendingFile()),
    } as unknown as jest.Mocked<WorkspaceScopedRepository<FileEntity>>;

    applicationRepository = {
      findOneOrFail: jest.fn().mockResolvedValue({
        universalIdentifier: 'application-universal-identifier',
      }),
    } as unknown as jest.Mocked<Repository<ApplicationEntity>>;

    fileUploadCompletionService = {
      completeUploadedFile: jest
        .fn()
        .mockResolvedValue({ mimeType: 'application/pdf', size: 10 }),
    } as unknown as jest.Mocked<FileUploadCompletionService>;

    fileUrlService = {
      signFileByIdUrl: jest
        .fn()
        .mockResolvedValue('https://api.example/file/signed'),
    } as unknown as jest.Mocked<FileUrlService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refuse completion by another application', async () => {
    await expect(
      completeUpload({ ...initiator, applicationId: 'application-b' }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).not.toHaveBeenCalled();
  });

  it('should refuse completion by the same application acting for another member', async () => {
    await expect(
      completeUpload({ ...initiator, userWorkspaceId: 'user-workspace-2' }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).not.toHaveBeenCalled();
  });

  it('should refuse completion by the plain user session behind an application upload', async () => {
    await expect(
      completeUpload({ ...initiator, applicationId: null }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).not.toHaveBeenCalled();
  });

  it('should refuse re-signing an already uploaded file to a foreign principal', async () => {
    fileRepository.findOne.mockResolvedValue(
      buildPendingFile({ status: FILE_STATUS.UPLOADED }),
    );

    await expect(
      completeUpload({ ...initiator, applicationId: 'application-b' }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    expect(fileUrlService.signFileByIdUrl).not.toHaveBeenCalled();
  });

  it('should complete the upload for the principal that initiated it', async () => {
    await expect(completeUpload(initiator)).resolves.toMatchObject({
      id: fileId,
      status: FILE_STATUS.UPLOADED,
      url: 'https://api.example/file/signed',
    });

    expect(
      fileUploadCompletionService.completeUploadedFile,
    ).toHaveBeenCalledTimes(1);
  });

  it('should complete a row stored without an initiating principal', async () => {
    fileRepository.findOne.mockResolvedValue(
      buildPendingFile({
        settings: { isTemporaryFile: true, toDelete: false },
      }),
    );

    await expect(
      completeUpload({ ...initiator, applicationId: 'application-b' }),
    ).resolves.toMatchObject({ id: fileId });
  });
});
