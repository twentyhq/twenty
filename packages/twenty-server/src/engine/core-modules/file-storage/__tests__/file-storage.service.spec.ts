import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileStorageDriverFactory: FileStorageDriverFactory;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  const mockFileRepository = {
    save: jest.fn(),
    upsert: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
  };

  const mockApplicationRepository = {
    findOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: FileStorageDriverFactory,
          useValue: mockFileStorageDriverFactory,
        },
        {
          provide: getRepositoryToken(FileEntity),
          useValue: mockFileRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: mockApplicationRepository,
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    fileStorageDriverFactory = module.get<FileStorageDriverFactory>(
      FileStorageDriverFactory,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storage operations', () => {
    let mockDriver: any;

    beforeEach(() => {
      mockDriver = {
        writeFile: jest.fn(),
        readFile: jest.fn(),
        delete: jest.fn(),
        move: jest.fn(),
        copy: jest.fn(),
        downloadFile: jest.fn(),
        downloadFolder: jest.fn(),
        uploadFolder: jest.fn(),
        checkFileExists: jest.fn(),
        checkFolderExists: jest.fn(),
        getPresignedUrl: jest.fn(),
      };

      mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
    });

    describe('copyLegacy', () => {
      it('should delegate to the current driver', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        mockDriver.copy.mockResolvedValue(undefined);

        await service.copyLegacy(copyParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.copy).toHaveBeenCalledWith(copyParams);
      });

      it('should handle copy errors', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        const error = new Error('Copy failed');

        mockDriver.copy.mockRejectedValue(error);

        await expect(service.copyLegacy(copyParams)).rejects.toThrow(
          'Copy failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.copy).toHaveBeenCalledWith(copyParams);
      });
    });

    describe('getPresignedUrl', () => {
      it('should delegate to the driver and return the URL', async () => {
        mockDriver.getPresignedUrl.mockResolvedValue(
          'https://s3.example.com/signed',
        );

        mockApplicationRepository.findOneOrFail.mockResolvedValue({
          universalIdentifier: 'app-uid',
        });

        const result = await service.getPresignedUrl({
          resourcePath: 'file.txt',
          fileFolder: 'workflow' as any,
          applicationUniversalIdentifier: 'app-uid',
          workspaceId: 'ws-id',
          responseContentType: 'image/png',
          responseContentDisposition: 'inline',
        });

        expect(result).toBe('https://s3.example.com/signed');
        expect(mockDriver.getPresignedUrl).toHaveBeenCalled();
      });

      it('should return null when driver returns null', async () => {
        mockDriver.getPresignedUrl.mockResolvedValue(null);

        mockApplicationRepository.findOneOrFail.mockResolvedValue({
          universalIdentifier: 'app-uid',
        });

        const result = await service.getPresignedUrl({
          resourcePath: 'file.txt',
          fileFolder: 'workflow' as any,
          applicationUniversalIdentifier: 'app-uid',
          workspaceId: 'ws-id',
        });

        expect(result).toBeNull();
      });
    });
  });

  describe('path traversal protection', () => {
    let mockDriver: any;

    beforeEach(() => {
      mockDriver = {
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('stream'),
        delete: jest.fn().mockResolvedValue(undefined),
        copy: jest.fn().mockResolvedValue(undefined),
        downloadFile: jest.fn().mockResolvedValue(undefined),
        checkFileExists: jest.fn().mockResolvedValue(true),
        checkFolderExists: jest.fn().mockResolvedValue(true),
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed.url'),
      };

      mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
      mockApplicationRepository.findOneOrFail.mockResolvedValue({
        id: 'app-id',
        universalIdentifier: 'app-uid',
      });
      mockFileRepository.upsert.mockResolvedValue(undefined);
      mockFileRepository.findOneOrFail.mockResolvedValue({
        id: 'file-id',
        path: 'BuiltFrontComponent/file.mjs',
        mimeType: 'application/javascript',
      });
    });

    const validResourceIdentifier = {
      workspaceId: 'workspace-123',
      applicationUniversalIdentifier: 'app-456',
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: 'src/components/my-component.mjs',
    };

    const expectedValidPath =
      'workspace-123/app-456/built-front-component/src/components/my-component.mjs';

    describe('readFile', () => {
      it('should allow valid relative paths', async () => {
        await service.readFile(validResourceIdentifier);

        expect(mockDriver.readFile).toHaveBeenCalledWith({
          filePath: expectedValidPath,
        });
      });

      it('should reject path traversal with ../', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath:
              '../../../victim-ws/victim-app/built-front-component/secret.mjs',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.readFile).not.toHaveBeenCalled();
      });

      it('should reject absolute paths', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath: '/etc/passwd',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.readFile).not.toHaveBeenCalled();
      });

      it('should reject single-level traversal escaping fileFolder', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath: '../source/handler.ts',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.readFile).not.toHaveBeenCalled();
      });
    });

    describe('checkFileExists', () => {
      it('should allow valid relative paths', async () => {
        await service.checkFileExists(validResourceIdentifier);

        expect(mockDriver.checkFileExists).toHaveBeenCalledWith({
          filePath: expectedValidPath,
        });
      });

      it('should reject path traversal with ../', () => {
        expect(() =>
          service.checkFileExists({
            ...validResourceIdentifier,
            resourcePath:
              '../../../other-ws/other-app/built-front-component/file.js',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.checkFileExists).not.toHaveBeenCalled();
      });
    });

    describe('getPresignedUrl', () => {
      it('should reject path traversal', async () => {
        await expect(
          service.getPresignedUrl({
            ...validResourceIdentifier,
            resourcePath: '../../../other-ws/file.js',
          }),
        ).rejects.toMatchObject({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        });

        expect(mockDriver.getPresignedUrl).not.toHaveBeenCalled();
      });
    });

    describe('downloadFile', () => {
      it('should reject path traversal', () => {
        expect(() =>
          service.downloadFile({
            ...validResourceIdentifier,
            resourcePath: '../../../other-ws/file.js',
            localPath: '/tmp/download.js',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.downloadFile).not.toHaveBeenCalled();
      });
    });

    describe('writeFile', () => {
      it('should reject path traversal on write', async () => {
        await expect(
          service.writeFile({
            ...validResourceIdentifier,
            resourcePath:
              '../../../victim-ws/victim-app/built-front-component/overwrite.mjs',
            sourceFile: Buffer.from('malicious'),
            mimeType: 'application/javascript',
            settings: { isTemporaryFile: false, toDelete: false },
          }),
        ).rejects.toMatchObject({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        });

        expect(mockDriver.writeFile).not.toHaveBeenCalled();
      });

      it('should allow valid writes', async () => {
        await service.writeFile({
          ...validResourceIdentifier,
          sourceFile: Buffer.from('valid content'),
          mimeType: 'application/javascript',
          settings: { isTemporaryFile: false, toDelete: false },
        });

        expect(mockDriver.writeFile).toHaveBeenCalledWith(
          expect.objectContaining({
            filePath: expectedValidPath,
          }),
        );
      });
    });

    describe('delete', () => {
      it('should reject path traversal on delete', async () => {
        await expect(
          service.delete({
            ...validResourceIdentifier,
            resourcePath: '../../../other-ws/other-app/folder',
          }),
        ).rejects.toMatchObject({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        });

        expect(mockDriver.delete).not.toHaveBeenCalled();
      });
    });

    describe('copy', () => {
      it('should reject path traversal in source', async () => {
        await expect(
          service.copy({
            from: {
              ...validResourceIdentifier,
              resourcePath: '../../../other-ws/secret.mjs',
            },
            to: validResourceIdentifier,
          }),
        ).rejects.toMatchObject({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        });

        expect(mockDriver.copy).not.toHaveBeenCalled();
      });

      it('should reject path traversal in destination', async () => {
        mockDriver.checkFileExists.mockResolvedValue(true);

        await expect(
          service.copy({
            from: validResourceIdentifier,
            to: {
              ...validResourceIdentifier,
              resourcePath: '../../../other-ws/overwrite.mjs',
            },
          }),
        ).rejects.toMatchObject({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        });
      });
    });

    describe('edge cases', () => {
      it('should reject traversal with excess .. segments', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath: 'foo/../../../../../../etc/passwd',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );
      });

      it('should accept deeply nested valid paths', async () => {
        await service.readFile({
          ...validResourceIdentifier,
          resourcePath: 'a/b/c/d/e/f/deep-file.mjs',
        });

        expect(mockDriver.readFile).toHaveBeenCalledWith({
          filePath:
            'workspace-123/app-456/built-front-component/a/b/c/d/e/f/deep-file.mjs',
        });
      });

      it('should reject exact 3-level traversal to another tenant', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath:
              '../../../target-ws/target-app/built-front-component/file.js',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );
      });

      it('should accept paths with dots that are not traversal', async () => {
        await service.readFile({
          ...validResourceIdentifier,
          resourcePath: 'v1.0.0/file.name.mjs',
        });

        expect(mockDriver.readFile).toHaveBeenCalled();
      });

      it('should reject empty resource path', () => {
        expect(() =>
          service.readFile({
            ...validResourceIdentifier,
            resourcePath: '',
          }),
        ).toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.readFile).not.toHaveBeenCalled();
      });
    });
  });
});
