import { Readable } from 'stream';

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'mocked-file-id'),
}));

describe('FileUploadService', () => {
  let service: FileUploadService;

  const fileStorageService = {
    createPendingFile: jest.fn(),
    getPresignedUploadUrl: jest.fn(),
    getFileMetadata: jest.fn(),
    writeFileStream: jest.fn(),
    readFile: jest.fn(),
  };

  const fileUrlService = {
    signFileByIdUrl: jest.fn().mockResolvedValue('https://signed-url'),
  };

  const jwtWrapperService = {
    signAsyncOrThrow: jest.fn().mockResolvedValue('upload-token'),
  };

  const twentyConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN') {
        return 900;
      }
      if (key === 'SERVER_URL') {
        return 'https://server.tld';
      }

      return undefined;
    }),
  };

  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          universalIdentifier: 'custom-app-uid',
        },
      }),
  };

  const applicationRepository = {
    findOneOrFail: jest.fn().mockResolvedValue({
      id: 'application-id',
      universalIdentifier: 'application-uid',
    }),
  };

  const fieldMetadataRepository = {
    findOneOrFail: jest.fn().mockResolvedValue({
      applicationId: 'application-id',
      universalIdentifier: 'field-metadata-uid',
    }),
  };

  const fileRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: FileStorageService, useValue: fileStorageService },
        { provide: FileUrlService, useValue: fileUrlService },
        { provide: JwtWrapperService, useValue: jwtWrapperService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: fieldMetadataRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: fileRepository,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  describe('createFileUpload', () => {
    it('should reject file folders without direct upload support', async () => {
      await expect(
        service.createFileUpload({
          workspaceId: 'workspace-id',
          filename: 'document.pdf',
          size: 1024,
          fileFolder: FileFolder.CorePicture,
        }),
      ).rejects.toThrow(FileUploadException);
    });

    it('should reject an invalid declared size', async () => {
      await expect(
        service.createFileUpload({
          workspaceId: 'workspace-id',
          filename: 'document.pdf',
          size: 0,
          fileFolder: FileFolder.FilesField,
          fieldMetadataId: 'field-metadata-id',
        }),
      ).rejects.toThrow(FileUploadException);
    });

    it('should create a PENDING file and return the presigned url when storage supports it', async () => {
      fileStorageService.getPresignedUploadUrl.mockResolvedValueOnce(
        'https://bucket/presigned-put',
      );

      const result = await service.createFileUpload({
        workspaceId: 'workspace-id',
        filename: 'document.pdf',
        size: 1024,
        fileFolder: FileFolder.FilesField,
        fieldMetadataId: 'field-metadata-id',
      });

      expect(fileStorageService.createPendingFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileId: 'mocked-file-id',
          size: 1024,
          mimeType: 'application/octet-stream',
          resourcePath: 'field-metadata-uid/mocked-file-id.pdf',
          settings: { isTemporaryFile: true, toDelete: false },
        }),
      );
      expect(result.uploadUrl).toBe('https://bucket/presigned-put');
      expect(result.contentType).toBe('application/octet-stream');
      expect(result.fileId).toBe('mocked-file-id');
    });

    it('should fall back to the server streaming endpoint when presign is unavailable', async () => {
      fileStorageService.getPresignedUploadUrl.mockResolvedValueOnce(null);

      const result = await service.createFileUpload({
        workspaceId: 'workspace-id',
        filename: 'archive.zip',
        size: 2048,
        fileFolder: FileFolder.Workflow,
      });

      expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          fileId: 'mocked-file-id',
        }),
        { expiresIn: 900 },
      );
      expect(result.uploadUrl).toBe(
        'https://server.tld/file-upload/mocked-file-id?token=upload-token',
      );
      expect(result.contentType).toBe('application/octet-stream');
    });

    it.each([FileFolder.EmailAttachment, FileFolder.AgentChat])(
      'should support direct upload for the %s folder',
      async (fileFolder) => {
        fileStorageService.getPresignedUploadUrl.mockResolvedValueOnce(
          'https://bucket/presigned-put',
        );

        const result = await service.createFileUpload({
          workspaceId: 'workspace-id',
          filename: 'document.pdf',
          size: 1024,
          fileFolder,
        });

        expect(fileStorageService.createPendingFile).toHaveBeenCalledWith(
          expect.objectContaining({
            fileFolder,
            resourcePath: 'mocked-file-id.pdf',
          }),
        );
        expect(result.uploadUrl).toBe('https://bucket/presigned-put');
      },
    );
  });

  describe('completeFileUpload', () => {
    const pendingFile = {
      id: 'file-id',
      path: 'files-field/field-metadata-uid/file-id.pdf',
      size: 1024,
      applicationId: 'application-id',
      mimeType: 'application/octet-stream',
      status: FILE_STATUS.PENDING,
      settings: { isTemporaryFile: true, toDelete: false },
      createdAt: new Date(),
    };

    const PDF_BYTES = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1');
    const PNG_BYTES = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    it('should throw when the file record does not exist', async () => {
      fileRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toThrow(FileUploadException);
    });

    it('should throw when the bytes are not in storage yet', async () => {
      fileRepository.findOne.mockResolvedValueOnce(pendingFile);
      fileStorageService.getFileMetadata.mockResolvedValueOnce(null);

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_NOT_UPLOADED,
      });
      expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the stored size does not match the declared size', async () => {
      fileRepository.findOne.mockResolvedValueOnce(pendingFile);
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 999 });

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_SIZE_MISMATCH,
      });
      expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it('should sniff the content, set the detected mime and flip to UPLOADED', async () => {
      fileRepository.findOne.mockResolvedValueOnce(pendingFile);
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 1024 });
      fileStorageService.readFile.mockResolvedValueOnce(
        Readable.from(PDF_BYTES),
      );

      const result = await service.completeFileUpload({
        workspaceId: 'workspace-id',
        fileId: 'file-id',
      });

      expect(fileStorageService.readFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFolder: FileFolder.FilesField,
          resourcePath: 'field-metadata-uid/file-id.pdf',
          workspaceId: 'workspace-id',
        }),
      );
      expect(fileRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'file-id' },
        { status: FILE_STATUS.UPLOADED, mimeType: 'application/pdf' },
      );
      expect(result.url).toBe('https://signed-url');
    });

    it('should override a spoofed extension with the detected content type', async () => {
      fileRepository.findOne.mockResolvedValueOnce({
        ...pendingFile,
        path: 'files-field/field-metadata-uid/file-id.pdf',
      });
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 1024 });
      fileStorageService.readFile.mockResolvedValueOnce(
        Readable.from(PNG_BYTES),
      );

      await service.completeFileUpload({
        workspaceId: 'workspace-id',
        fileId: 'file-id',
      });

      expect(fileRepository.update).toHaveBeenCalledWith(
        'workspace-id',
        { id: 'file-id' },
        { status: FILE_STATUS.UPLOADED, mimeType: 'image/png' },
      );
    });

    it('should reject when the content cannot be matched to the declared extension', async () => {
      fileRepository.findOne.mockResolvedValueOnce({
        ...pendingFile,
        path: 'files-field/field-metadata-uid/file-id.png',
      });
      fileStorageService.getFileMetadata.mockResolvedValueOnce({ size: 1024 });
      fileStorageService.readFile.mockResolvedValueOnce(
        Readable.from(Buffer.from('not-an-image-just-text')),
      );

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toThrow();
      expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it('should be idempotent when the file is already UPLOADED', async () => {
      fileRepository.findOne.mockResolvedValueOnce({
        ...pendingFile,
        status: FILE_STATUS.UPLOADED,
      });

      const result = await service.completeFileUpload({
        workspaceId: 'workspace-id',
        fileId: 'file-id',
      });

      expect(fileStorageService.getFileMetadata).not.toHaveBeenCalled();
      expect(fileRepository.update).not.toHaveBeenCalled();
      expect(result.url).toBe('https://signed-url');
    });

    it('should refuse confirming files that already left the upload flow', async () => {
      fileRepository.findOne.mockResolvedValueOnce({
        ...pendingFile,
        status: FILE_STATUS.UPLOADED,
        settings: { isTemporaryFile: false, toDelete: false },
      });

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.BAD_REQUEST,
      });
    });

    it('should refuse files outside direct-upload folders', async () => {
      fileRepository.findOne.mockResolvedValueOnce({
        ...pendingFile,
        path: 'core-picture/file-id.png',
      });

      await expect(
        service.completeFileUpload({
          workspaceId: 'workspace-id',
          fileId: 'file-id',
        }),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_NOT_FOUND,
      });
    });
  });
});
