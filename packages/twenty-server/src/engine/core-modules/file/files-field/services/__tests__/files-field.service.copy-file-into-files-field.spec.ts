import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('FilesFieldService.copyFileIntoFilesField', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const chatFileId = '20202020-0000-4000-8000-000000000002';
  const fieldMetadataId = '20202020-0000-4000-8000-000000000004';

  let fileStorageService: jest.Mocked<FileStorageService>;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;
  let fieldMetadataRepository: jest.Mocked<Repository<FieldMetadataEntity>>;
  let fileRepository: jest.Mocked<WorkspaceScopedRepository<FileEntity>>;

  const buildService = () =>
    new FilesFieldService(
      fileStorageService,
      applicationRepository,
      fieldMetadataRepository,
      fileRepository,
      {} as FileUrlService,
    );

  const buildChatFile = (overrides: Partial<FileEntity> = {}) =>
    ({
      id: chatFileId,
      path: `agent-chat/${chatFileId}.pdf`,
      status: FILE_STATUS.UPLOADED,
      applicationId: 'chat-application-id',
      mimeType: 'application/pdf',
      size: 1234,
      ...overrides,
    }) as FileEntity;

  beforeEach(() => {
    fileStorageService = {
      copyFile: jest
        .fn()
        .mockImplementation(async ({ fileId }) => ({ id: fileId })),
    } as unknown as jest.Mocked<FileStorageService>;

    applicationRepository = {
      findOneOrFail: jest.fn().mockImplementation(async ({ where }) => ({
        universalIdentifier: `${where.id}-universal-identifier`,
      })),
    } as unknown as jest.Mocked<Repository<ApplicationEntity>>;

    fieldMetadataRepository = {
      findOneOrFail: jest.fn().mockResolvedValue({
        applicationId: 'field-application-id',
        universalIdentifier: 'field-universal-identifier',
      }),
    } as unknown as jest.Mocked<Repository<FieldMetadataEntity>>;

    fileRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<WorkspaceScopedRepository<FileEntity>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when the file does not exist', async () => {
    await expect(
      buildService().copyFileIntoFilesField({
        fileId: chatFileId,
        workspaceId,
        fieldMetadataId,
      }),
    ).rejects.toThrow(`File ${chatFileId} not found`);

    expect(fileStorageService.copyFile).not.toHaveBeenCalled();
  });

  it('should throw when the upload has not been completed', async () => {
    fileRepository.findOne.mockResolvedValue(
      buildChatFile({ status: FILE_STATUS.PENDING }),
    );

    await expect(
      buildService().copyFileIntoFilesField({
        fileId: chatFileId,
        workspaceId,
        fieldMetadataId,
      }),
    ).rejects.toThrow(`File ${chatFileId} upload has not been completed`);

    expect(fileStorageService.copyFile).not.toHaveBeenCalled();
  });

  it('should throw when the file lives in a folder that cannot be copied', async () => {
    fileRepository.findOne.mockResolvedValue(
      buildChatFile({ path: 'core-picture/logo.png' }),
    );

    await expect(
      buildService().copyFileIntoFilesField({
        fileId: chatFileId,
        workspaceId,
        fieldMetadataId,
      }),
    ).rejects.toThrow(`File ${chatFileId} cannot be copied into a files field`);

    expect(fileStorageService.copyFile).not.toHaveBeenCalled();
  });

  it('should copy an agent-chat file into the files field partition', async () => {
    fileRepository.findOne.mockResolvedValue(buildChatFile());

    const result = await buildService().copyFileIntoFilesField({
      fileId: chatFileId,
      workspaceId,
      fieldMetadataId,
    });

    expect(fileStorageService.copyFile).toHaveBeenCalledTimes(1);

    const copyFileArgs = fileStorageService.copyFile.mock.calls[0][0];

    expect(copyFileArgs.from).toEqual({
      workspaceId,
      applicationUniversalIdentifier:
        'chat-application-id-universal-identifier',
      fileFolder: 'agent-chat',
      resourcePath: `${chatFileId}.pdf`,
    });
    expect(copyFileArgs.to.fileFolder).toBe('files-field');
    expect(copyFileArgs.to.applicationUniversalIdentifier).toBe(
      'field-application-id-universal-identifier',
    );
    expect(copyFileArgs.to.resourcePath).toMatch(
      /^field-universal-identifier\/[0-9a-f-]{36}\.pdf$/,
    );
    expect(copyFileArgs.mimeType).toBe('application/pdf');
    expect(copyFileArgs.size).toBe(1234);
    expect(copyFileArgs.settings).toEqual({
      isTemporaryFile: true,
      toDelete: false,
    });

    expect(copyFileArgs.fileId).not.toBe(chatFileId);
    expect(result.id).toBe(copyFileArgs.fileId);
  });

  it('should keep the source extension when copying', async () => {
    fileRepository.findOne.mockResolvedValue(
      buildChatFile({ path: `agent-chat/${chatFileId}.csv` }),
    );

    await buildService().copyFileIntoFilesField({
      fileId: chatFileId,
      workspaceId,
      fieldMetadataId,
    });

    expect(
      fileStorageService.copyFile.mock.calls[0][0].to.resourcePath,
    ).toMatch(/\.csv$/);
  });
});
