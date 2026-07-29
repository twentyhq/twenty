import { Readable } from 'stream';

import { Test, type TestingModule } from '@nestjs/testing';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationDevelopmentThrottlerService } from 'src/engine/core-modules/application/application-development/application-development-throttler.service';
import { ApplicationFileUploadService } from 'src/engine/core-modules/application/application-development/application-file-upload.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-uid';

describe('ApplicationFileUploadService', () => {
  let service: ApplicationFileUploadService;

  const applicationService = {
    findByUniversalIdentifier: jest.fn().mockResolvedValue({
      id: 'application-id',
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
  };

  const applicationDevelopmentThrottlerService = {
    throttlePerApplication: jest.fn().mockResolvedValue(undefined),
  };

  const fileStorageService = {
    createPendingFile: jest.fn(),
    getFileMetadata: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  };

  const fileUploadService = {
    buildUploadTarget: jest.fn(),
    detectUploadedMimeTypeOrThrow: jest.fn(),
  };

  const fileRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    fileStorageService.createPendingFile.mockImplementation(({ fileId }) =>
      Promise.resolve({ id: fileId }),
    );
    fileUploadService.buildUploadTarget.mockImplementation(({ fileId }) =>
      Promise.resolve({
        fileId,
        uploadUrl: `https://storage.tld/${fileId}`,
        contentType: 'application/octet-stream',
        expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationFileUploadService,
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: ApplicationDevelopmentThrottlerService,
          useValue: applicationDevelopmentThrottlerService,
        },
        { provide: FileStorageService, useValue: fileStorageService },
        { provide: FileUploadService, useValue: fileUploadService },
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: fileRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationFileUploadService>(
      ApplicationFileUploadService,
    );
  });

  describe('createApplicationFileUploads', () => {
    it('should return one upload target per requested file for a single throttled call', async () => {
      const targets = await service.createApplicationFileUploads({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        files: [
          {
            fileFolder: FileFolder.BuiltLogicFunction,
            filePath: 'handler.mjs',
            size: 12,
          },
          {
            fileFolder: FileFolder.PublicAsset,
            filePath: 'logo.png',
            size: 34,
          },
        ],
      });

      expect(targets).toHaveLength(2);
      expect(targets[0].filePath).toBe('handler.mjs');
      expect(targets[0].fileFolder).toBe(FileFolder.BuiltLogicFunction);
      expect(targets[0].uploadUrl).toContain('https://storage.tld/');
      expect(targets[1].filePath).toBe('logo.png');
      expect(
        applicationDevelopmentThrottlerService.throttlePerApplication,
      ).toHaveBeenCalledTimes(1);
    });

    it('should create every pending file as octet-stream so it can be sniffed after upload', async () => {
      await service.createApplicationFileUploads({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        files: [
          {
            fileFolder: FileFolder.Source,
            filePath: 'src/index.ts',
            size: 12,
          },
        ],
      });

      expect(fileStorageService.createPendingFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFolder: FileFolder.Source,
          resourcePath: 'src/index.ts',
          mimeType: 'application/octet-stream',
          size: 12,
        }),
      );
    });

    it('should reject file folders that are not application file folders', async () => {
      await expect(
        service.createApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          files: [
            {
              fileFolder: FileFolder.FilesField,
              filePath: 'document.pdf',
              size: 12,
            },
          ],
        }),
      ).rejects.toThrow(ApplicationException);

      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    });

    it('should reject the whole batch when one path escapes the application folder', async () => {
      await expect(
        service.createApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          files: [
            {
              fileFolder: FileFolder.Source,
              filePath: 'src/index.ts',
              size: 12,
            },
            {
              fileFolder: FileFolder.Source,
              filePath: '../../../etc/passwd',
              size: 12,
            },
          ],
        }),
      ).rejects.toThrow(ApplicationException);

      expect(fileStorageService.createPendingFile).not.toHaveBeenCalled();
    });

    it('should reject a file larger than the direct upload limit', async () => {
      await expect(
        service.createApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          files: [
            {
              fileFolder: FileFolder.Source,
              filePath: 'src/index.ts',
              size: 2 * 1024 * 1024 * 1024,
            },
          ],
        }),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('completeApplicationFileUploads', () => {
    const pendingFile = {
      id: 'file-id',
      path: `${FileFolder.BuiltLogicFunction}/handler.mjs`,
      size: 12,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: FILE_STATUS.PENDING,
    };

    it('should flip a confirmed file to uploaded with its sniffed mime type', async () => {
      fileRepository.find.mockResolvedValueOnce([pendingFile]);
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 12 });
      fileUploadService.detectUploadedMimeTypeOrThrow.mockResolvedValueOnce(
        'application/javascript',
      );

      const files = await service.completeApplicationFileUploads({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileIds: ['file-id'],
      });

      expect(files).toEqual([
        {
          id: 'file-id',
          path: pendingFile.path,
          size: 12,
          createdAt: pendingFile.createdAt,
        },
      ]);
      expect(fileRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'file-id' },
        {
          status: FILE_STATUS.UPLOADED,
          mimeType: 'application/javascript',
        },
      );
      expect(fileStorageService.writeFile).not.toHaveBeenCalled();
    });

    it('should reject a file whose stored size does not match the declared one', async () => {
      fileRepository.find.mockResolvedValueOnce([pendingFile]);
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 999 });

      await expect(
        service.completeApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          fileIds: ['file-id'],
        }),
      ).rejects.toThrow(ApplicationException);

      expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it('should reject a file whose bytes never reached storage', async () => {
      fileRepository.find.mockResolvedValueOnce([pendingFile]);
      fileStorageService.getFileMetadata.mockResolvedValueOnce(null);

      await expect(
        service.completeApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          fileIds: ['file-id'],
        }),
      ).rejects.toThrow(ApplicationException);
    });

    it('should reject file ids that do not belong to the application', async () => {
      fileRepository.find.mockResolvedValueOnce([]);

      await expect(
        service.completeApplicationFileUploads({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          fileIds: ['file-id-from-another-application'],
        }),
      ).rejects.toThrow(ApplicationException);
    });

    it('should sanitize an uploaded svg before it can ever be served', async () => {
      const svgFile = {
        ...pendingFile,
        path: `${FileFolder.PublicAsset}/logo.svg`,
        size: 60,
      };

      fileRepository.find.mockResolvedValueOnce([svgFile]);
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 60 });
      fileUploadService.detectUploadedMimeTypeOrThrow.mockResolvedValueOnce(
        'image/svg+xml',
      );
      fileStorageService.readFile.mockResolvedValueOnce(
        Readable.from([Buffer.from('<svg><script>alert(1)</script></svg>')]),
      );
      fileStorageService.writeFile.mockResolvedValueOnce({ size: 11 });

      const files = await service.completeApplicationFileUploads({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileIds: ['file-id'],
      });

      expect(fileStorageService.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileId: 'file-id',
          resourcePath: 'logo.svg',
          sourceFile: expect.not.stringContaining('<script>'),
        }),
      );
      expect(files[0].size).toBe(11);
    });
  });
});
