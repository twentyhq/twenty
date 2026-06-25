import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileStorageDriverFactory: FileStorageDriverFactory;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  const mockFileRepository = {
    save: jest.fn(),
    upsertAndReturnOne: jest.fn(),
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
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
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
      mockFileRepository.upsertAndReturnOne.mockResolvedValue({
        id: 'file-id',
        path: 'BuiltFrontComponent/file.mjs',
        mimeType: 'application/javascript',
      });
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

    const validFolderIdentifier = {
      workspaceId: 'workspace-123',
      applicationUniversalIdentifier: 'app-456',
      fileFolder: FileFolder.BuiltFrontComponent,
    };

    const expectedValidPath =
      'workspace-123/app-456/built-front-component/src/components/my-component.mjs';

    type RejectedFilePathContext = {
      resourcePath: string;
    };

    const REJECTED_FILE_PATHS: EachTestingContext<RejectedFilePathContext>[] = [
      {
        title: 'path traversal with ../',
        context: {
          resourcePath:
            '../../../victim-ws/victim-app/built-front-component/secret.mjs',
        },
      },
      {
        title: 'absolute path',
        context: { resourcePath: '/etc/passwd' },
      },
      {
        title: 'single-level traversal escaping fileFolder',
        context: { resourcePath: '../source/handler.ts' },
      },
      {
        title: 'excess .. segments',
        context: { resourcePath: 'foo/../../../../../../etc/passwd' },
      },
      {
        title: 'exact 3-level traversal to another tenant',
        context: {
          resourcePath:
            '../../../target-ws/target-app/built-front-component/file.js',
        },
      },
      {
        title: 'empty resource path',
        context: { resourcePath: '' },
      },
    ];

    type AcceptedFilePathContext = {
      resourcePath: string;
      expectedStoragePath: string;
    };

    const ACCEPTED_FILE_PATHS: EachTestingContext<AcceptedFilePathContext>[] = [
      {
        title: 'valid relative path',
        context: {
          resourcePath: 'src/components/my-component.mjs',
          expectedStoragePath: expectedValidPath,
        },
      },
      {
        title: 'deeply nested valid path',
        context: {
          resourcePath: 'a/b/c/d/e/f/deep-file.mjs',
          expectedStoragePath:
            'workspace-123/app-456/built-front-component/a/b/c/d/e/f/deep-file.mjs',
        },
      },
      {
        title: 'path with dots that are not traversal',
        context: {
          resourcePath: 'v1.0.0/file.name.mjs',
          expectedStoragePath:
            'workspace-123/app-456/built-front-component/v1.0.0/file.name.mjs',
        },
      },
      {
        title: 'path with hidden directory (dot-prefixed segment)',
        context: {
          resourcePath: '.hidden/file.name.mjs',
          expectedStoragePath:
            'workspace-123/app-456/built-front-component/.hidden/file.name.mjs',
        },
      },
    ];

    describe('readFile', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        ({ context }) => {
          expect(() =>
            service.readFile({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
            }),
          ).toThrow(
            expect.objectContaining({
              code: FileStorageExceptionCode.ACCESS_DENIED,
            }),
          );

          expect(mockDriver.readFile).not.toHaveBeenCalled();
        },
      );

      it.each(eachTestingContextFilter(ACCEPTED_FILE_PATHS))(
        'should accept $title',
        async ({ context }) => {
          await service.readFile({
            ...validResourceIdentifier,
            resourcePath: context.resourcePath,
          });

          expect(mockDriver.readFile).toHaveBeenCalledWith({
            filePath: context.expectedStoragePath,
          });
        },
      );
    });

    describe('checkFileExists', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        ({ context }) => {
          expect(() =>
            service.checkFileExists({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
            }),
          ).toThrow(
            expect.objectContaining({
              code: FileStorageExceptionCode.ACCESS_DENIED,
            }),
          );

          expect(mockDriver.checkFileExists).not.toHaveBeenCalled();
        },
      );
    });

    describe('getPresignedUrl', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        async ({ context }) => {
          await expect(
            service.getPresignedUrl({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
            }),
          ).rejects.toMatchObject({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          });

          expect(mockDriver.getPresignedUrl).not.toHaveBeenCalled();
        },
      );
    });

    describe('downloadFile', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        ({ context }) => {
          expect(() =>
            service.downloadFile({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
              localPath: '/tmp/download.js',
            }),
          ).toThrow(
            expect.objectContaining({
              code: FileStorageExceptionCode.ACCESS_DENIED,
            }),
          );

          expect(mockDriver.downloadFile).not.toHaveBeenCalled();
        },
      );
    });

    describe('writeFile', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        async ({ context }) => {
          await expect(
            service.writeFile({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
              sourceFile: Buffer.from('malicious'),
              settings: { isTemporaryFile: false, toDelete: false },
            }),
          ).rejects.toMatchObject({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          });

          expect(mockDriver.writeFile).not.toHaveBeenCalled();
        },
      );

      it('should allow valid writes', async () => {
        await service.writeFile({
          ...validResourceIdentifier,
          sourceFile: Buffer.from('valid content'),
          settings: { isTemporaryFile: false, toDelete: false },
        });

        expect(mockDriver.writeFile).toHaveBeenCalledWith(
          expect.objectContaining({
            filePath: expectedValidPath,
          }),
        );
      });

      describe('magic-byte backstop', () => {
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
          0x0d, 0x49, 0x48, 0x44, 0x52,
        ]);
        const textBuffer = Buffer.from('Hello, world!', 'utf-8');

        it('should reject buffer whose magic bytes do not match the path extension', async () => {
          await expect(
            service.writeFile({
              workspaceId: 'workspace-123',
              applicationUniversalIdentifier: 'app-456',
              fileFolder: FileFolder.PublicAsset,
              resourcePath: 'assets/fake-image.png',
              sourceFile: textBuffer,
              settings: { isTemporaryFile: false, toDelete: false },
            }),
          ).rejects.toMatchObject({
            code: FileStorageExceptionCode.INVALID_EXTENSION,
          });

          expect(mockDriver.writeFile).not.toHaveBeenCalled();
        });

        it('should accept buffer whose magic bytes match the path extension and persist the bytes-derived mime', async () => {
          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.PublicAsset,
            resourcePath: 'assets/photo.png',
            sourceFile: pngBuffer,
            settings: { isTemporaryFile: false, toDelete: false },
          });

          expect(mockDriver.writeFile).toHaveBeenCalledWith(
            expect.objectContaining({ mimeType: 'image/png' }),
          );
          expect(mockFileRepository.upsertAndReturnOne).toHaveBeenCalledWith(
            'workspace-123',
            expect.objectContaining({ mimeType: 'image/png' }),
            ['path', 'workspaceId', 'applicationId'],
          );
        });

        it('should persist application/typescript for a TypeScript source string (TWENTY_MIME_POLICY)', async () => {
          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.Source,
            resourcePath: 'src/index.tsx',
            sourceFile: 'export const App = () => null;',
            settings: { isTemporaryFile: false, toDelete: false },
          });

          expect(mockDriver.writeFile).toHaveBeenCalledWith(
            expect.objectContaining({ mimeType: 'application/typescript' }),
          );
        });

        it('should persist application/typescript for a TypeScript source buffer (policy beats mrmime collision)', async () => {
          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.Source,
            resourcePath: 'src/handler.ts',
            sourceFile: Buffer.from(
              'export const handler = () => null;',
              'utf-8',
            ),
            settings: { isTemporaryFile: false, toDelete: false },
          });

          expect(mockDriver.writeFile).toHaveBeenCalledWith(
            expect.objectContaining({ mimeType: 'application/typescript' }),
          );
        });
      });

      describe('SVG sanitization (centralized invariant)', () => {
        const maliciousSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><circle r="10" /></svg>';

        it('should strip scripts and event handlers from an SVG string upload', async () => {
          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.PublicAsset,
            resourcePath: 'assets/icon.svg',
            sourceFile: maliciousSvg,
            settings: { isTemporaryFile: false, toDelete: false },
          });

          const driverCall = mockDriver.writeFile.mock.calls[0][0];

          expect(driverCall.mimeType).toBe('image/svg+xml');
          expect(typeof driverCall.sourceFile).toBe('string');
          expect(driverCall.sourceFile).not.toContain('<script>');
          expect(driverCall.sourceFile).not.toContain('onload');
          expect(driverCall.sourceFile).toContain('<circle');
        });

        it('should strip scripts and event handlers from an SVG buffer upload', async () => {
          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.PublicAsset,
            resourcePath: 'assets/icon.svg',
            sourceFile: Buffer.from(maliciousSvg, 'utf-8'),
            settings: { isTemporaryFile: false, toDelete: false },
          });

          const driverCall = mockDriver.writeFile.mock.calls[0][0];

          expect(driverCall.mimeType).toBe('image/svg+xml');
          expect(driverCall.sourceFile).not.toContain('<script>');
          expect(driverCall.sourceFile).not.toContain('onload');
        });

        it('should leave non-SVG content untouched (sanitize is no-op)', async () => {
          const original = '{"foo": "bar"}';

          await service.writeFile({
            workspaceId: 'workspace-123',
            applicationUniversalIdentifier: 'app-456',
            fileFolder: FileFolder.Source,
            resourcePath: 'package.json',
            sourceFile: original,
            settings: { isTemporaryFile: false, toDelete: false },
          });

          const driverCall = mockDriver.writeFile.mock.calls[0][0];

          expect(driverCall.sourceFile).toBe(original);
        });
      });
    });

    describe('deleteFile', () => {
      it.each(eachTestingContextFilter(REJECTED_FILE_PATHS))(
        'should reject $title',
        async ({ context }) => {
          await expect(
            service.deleteFile({
              ...validResourceIdentifier,
              resourcePath: context.resourcePath,
            }),
          ).rejects.toMatchObject({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          });

          expect(mockDriver.delete).not.toHaveBeenCalled();
        },
      );

      it('should call driver.delete with dirname and basename', async () => {
        await service.deleteFile(validResourceIdentifier);

        expect(mockDriver.delete).toHaveBeenCalledWith({
          folderPath:
            'workspace-123/app-456/built-front-component/src/components',
          filename: 'my-component.mjs',
        });
      });
    });

    describe('deleteFolder', () => {
      type RejectedFolderPathContext = {
        folderPath: string;
      };

      const REJECTED_FOLDER_PATHS: EachTestingContext<RejectedFolderPathContext>[] =
        [
          {
            title: 'path traversal with ../',
            context: { folderPath: '../../../other-ws/other-app/folder' },
          },
          {
            title: 'absolute path',
            context: { folderPath: '/etc/secret-folder' },
          },
          {
            title: 'empty folder path',
            context: { folderPath: '' },
          },
          {
            title: 'folder path with special characters (spaces)',
            context: { folderPath: 'my folder/data' },
          },
          {
            title: 'folder path with shell metacharacters',
            context: { folderPath: 'folder;rm -rf/' },
          },
          {
            title: 'file path with .mjs extension',
            context: { folderPath: 'src/logic-functions/handler.mjs' },
          },
          {
            title: 'file path with .ts extension',
            context: { folderPath: 'src/components/index.ts' },
          },
          {
            title: 'file path with .json extension',
            context: { folderPath: 'config/settings.json' },
          },
          {
            title: 'dotted version string (extname detects .0)',
            context: { folderPath: 'v1.0.0' },
          },
          {
            title: 'numeric-only extension (.7z)',
            context: { folderPath: 'archive.7z' },
          },
        ];

      type AcceptedFolderPathContext = {
        folderPath: string;
        expectedStoragePath: string;
      };

      const ACCEPTED_FOLDER_PATHS: EachTestingContext<AcceptedFolderPathContext>[] =
        [
          {
            title: 'UUID folder path',
            context: {
              folderPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
              expectedStoragePath:
                'workspace-123/app-456/built-front-component/8b2df3cc-23ad-4e1b-87fd-f880d4cefd58/',
            },
          },
          {
            title: 'simple folder name',
            context: {
              folderPath: 'my-folder',
              expectedStoragePath:
                'workspace-123/app-456/built-front-component/my-folder/',
            },
          },
          {
            title: 'nested folder path with numeric ranges',
            context: {
              folderPath: '0000-0999/tmp200/toto',
              expectedStoragePath:
                'workspace-123/app-456/built-front-component/0000-0999/tmp200/toto/',
            },
          },
        ];

      it.each(eachTestingContextFilter(REJECTED_FOLDER_PATHS))(
        'should reject $title',
        async ({ context }) => {
          await expect(
            service.deleteFolder({
              ...validFolderIdentifier,
              folderPath: context.folderPath,
            }),
          ).rejects.toMatchObject({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          });

          expect(mockDriver.delete).not.toHaveBeenCalled();
        },
      );

      it.each(eachTestingContextFilter(ACCEPTED_FOLDER_PATHS))(
        'should accept $title',
        async ({ context }) => {
          await service.deleteFolder({
            ...validFolderIdentifier,
            folderPath: context.folderPath,
          });

          expect(mockDriver.delete).toHaveBeenCalledWith({
            folderPath: context.expectedStoragePath,
          });
        },
      );
    });

    describe('deleteByFileId', () => {
      it('should delegate to deleteFile with the correct resource path', async () => {
        mockFileRepository.findOneOrFail.mockResolvedValue({
          id: 'file-id',
          path: 'built-front-component/src/components/my-component.mjs',
          applicationId: 'app-id',
          workspaceId: 'workspace-123',
        });

        mockApplicationRepository.findOneOrFail.mockResolvedValue({
          id: 'app-id',
          universalIdentifier: 'app-456',
        });

        await service.deleteByFileId({
          fileId: 'file-id',
          workspaceId: 'workspace-123',
          fileFolder: FileFolder.BuiltFrontComponent,
        });

        expect(mockDriver.delete).toHaveBeenCalledWith({
          folderPath:
            'workspace-123/app-456/built-front-component/src/components',
          filename: 'my-component.mjs',
        });

        expect(mockFileRepository.delete).toHaveBeenCalledWith(
          'workspace-123',
          {
            path: 'built-front-component/src/components/my-component.mjs',
            applicationId: 'app-id',
          },
        );
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
  });
});
