import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Readable } from 'stream';

import { ServerFileFolder } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

describe('ServerFileStorageService', () => {
  let service: ServerFileStorageService;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  const mockServerFileRepository = {
    upsert: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockDriver = {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    delete: jest.fn(),
    checkFileExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerFileStorageService,
        {
          provide: FileStorageDriverFactory,
          useValue: mockFileStorageDriverFactory,
        },
        {
          provide: getRepositoryToken(FileEntity),
          useValue: mockServerFileRepository,
        },
      ],
    }).compile();

    service = module.get<ServerFileStorageService>(ServerFileStorageService);

    jest.clearAllMocks();

    mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
  });

  describe.each([
    [
      'readServerFile',
      (resourcePath: string) =>
        service.readServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath,
        }),
    ],
    [
      'checkServerFileExists',
      (resourcePath: string) =>
        service.checkServerFileExists({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath,
        }),
    ],
    [
      'deleteServerFile',
      (resourcePath: string) =>
        service.deleteServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath,
        }),
    ],
  ] as const)('%s traversal protection', (_methodName, invoke) => {
    it.each(['../workspace-id/stolen.json', 'a/../../escape.json'])(
      'should reject traversal resource path %s without touching storage',
      async (resourcePath) => {
        await expect(
          (async () => {
            await invoke(resourcePath);
          })(),
        ).rejects.toThrow(
          expect.objectContaining({
            code: FileStorageExceptionCode.ACCESS_DENIED,
          }),
        );

        expect(mockDriver.readFile).not.toHaveBeenCalled();
        expect(mockDriver.checkFileExists).not.toHaveBeenCalled();
        expect(mockDriver.delete).not.toHaveBeenCalled();
      },
    );
  });

  describe('writeServerFile', () => {
    it('should write bytes with the server prefix and upsert the row on path conflict', async () => {
      const serverFile = {
        id: 'server-file-id',
        path: 'application-registration/registration-id/manifests/manifest.json',
      } as FileEntity;

      mockServerFileRepository.findOneByOrFail.mockResolvedValue(serverFile);

      const result = await service.writeServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifests/manifest.json',
        contents: '{"name":"my-app"}',
        mimeType: 'application/json',
      });

      expect(mockDriver.writeFile).toHaveBeenCalledWith({
        filePath:
          'server/application-registration/registration-id/manifests/manifest.json',
        mimeType: 'application/json',
        sourceFile: '{"name":"my-app"}',
      });
      expect(mockServerFileRepository.upsert).toHaveBeenCalledWith(
        {
          path: 'application-registration/registration-id/manifests/manifest.json',
          workspaceId: null,
          size: Buffer.byteLength('{"name":"my-app"}'),
          mimeType: 'application/json',
          applicationRegistrationId: 'registration-id',
        },
        {
          conflictPaths: ['applicationRegistrationId', 'path'],
        },
      );
      expect(mockServerFileRepository.findOneByOrFail).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        path: 'application-registration/registration-id/manifests/manifest.json',
        workspaceId: IsNull(),
      });
      expect(result).toEqual(serverFile);
    });

    it('should reject a traversal resource path without touching storage', async () => {
      await expect(
        service.writeServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath: '../workspace-id/stolen.json',
          contents: '{}',
          mimeType: 'application/json',
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        }),
      );

      expect(mockDriver.writeFile).not.toHaveBeenCalled();
      expect(mockServerFileRepository.upsert).not.toHaveBeenCalled();
    });

    it('should propagate driver write failures without upserting the row', async () => {
      mockDriver.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(
        service.writeServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath: 'manifest.json',
          contents: '{}',
          mimeType: 'application/json',
        }),
      ).rejects.toThrow('Write failed');

      expect(mockServerFileRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('readServerFile', () => {
    it('should read from the server-prefixed storage path', async () => {
      const stream = Readable.from(['{}']);

      mockServerFileRepository.findOneBy.mockResolvedValue({
        id: 'server-file-id',
        path: 'application-registration/registration-id/manifests/manifest.json',
        mimeType: 'application/json',
      } as FileEntity);
      mockDriver.readFile.mockResolvedValue(stream);

      const result = await service.readServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifests/manifest.json',
      });

      expect(mockServerFileRepository.findOneBy).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        path: 'application-registration/registration-id/manifests/manifest.json',
        workspaceId: IsNull(),
      });
      expect(mockDriver.readFile).toHaveBeenCalledWith({
        filePath:
          'server/application-registration/registration-id/manifests/manifest.json',
      });
      expect(result).toEqual({ stream, mimeType: 'application/json' });
    });

    it('should propagate the missing-file exception from the driver', async () => {
      mockServerFileRepository.findOneBy.mockResolvedValue({
        id: 'server-file-id',
        path: 'application-registration/registration-id/missing.json',
      } as FileEntity);
      mockDriver.readFile.mockRejectedValueOnce(
        new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        ),
      );

      await expect(
        service.readServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath: 'missing.json',
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.FILE_NOT_FOUND,
        }),
      );
    });

    it('should throw FILE_NOT_FOUND without reading bytes when the row is missing', async () => {
      mockServerFileRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.readServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath: 'deleted.json',
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.FILE_NOT_FOUND,
        }),
      );

      expect(mockDriver.readFile).not.toHaveBeenCalled();
    });
  });

  describe('findServerFile', () => {
    it('should return the row matching the registration and path', async () => {
      const serverFile = {
        id: 'server-file-id',
        path: 'application-registration/registration-id/manifest.json',
      } as FileEntity;

      mockServerFileRepository.findOneBy.mockResolvedValue(serverFile);

      const result = await service.findServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifest.json',
      });

      expect(mockServerFileRepository.findOneBy).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        path: 'application-registration/registration-id/manifest.json',
        workspaceId: IsNull(),
      });
      expect(result).toBe(serverFile);
    });

    it('should return null when no row matches', async () => {
      mockServerFileRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'missing.json',
      });

      expect(result).toBeNull();
    });
  });

  describe('checkServerFileExists', () => {
    it('should check existence on the server-prefixed storage path', async () => {
      mockDriver.checkFileExists.mockResolvedValue(true);

      const result = await service.checkServerFileExists({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifest.json',
      });

      expect(mockDriver.checkFileExists).toHaveBeenCalledWith({
        filePath:
          'server/application-registration/registration-id/manifest.json',
      });
      expect(result).toBe(true);
    });
  });

  describe('deleteServerFile', () => {
    it('should delete the bytes and the row', async () => {
      await service.deleteServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifests/manifest.json',
      });

      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'server/application-registration/registration-id/manifests',
        filename: 'manifest.json',
      });
      expect(mockServerFileRepository.delete).toHaveBeenCalledWith({
        path: 'application-registration/registration-id/manifests/manifest.json',
        workspaceId: IsNull(),
      });
    });

    it('should still delete the row when the bytes deletion fails', async () => {
      mockDriver.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await service.deleteServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId: 'registration-id',
        resourcePath: 'manifest.json',
      });

      expect(mockServerFileRepository.delete).toHaveBeenCalledWith({
        path: 'application-registration/registration-id/manifest.json',
        workspaceId: IsNull(),
      });
    });

    it('should propagate row deletion failures', async () => {
      mockServerFileRepository.delete.mockRejectedValueOnce(
        new Error('Row deletion failed'),
      );

      await expect(
        service.deleteServerFile({
          fileFolder: ServerFileFolder.ApplicationRegistration,
          applicationRegistrationId: 'registration-id',
          resourcePath: 'manifest.json',
        }),
      ).rejects.toThrow('Row deletion failed');
    });
  });

  describe('deleteByApplicationRegistrationId', () => {
    it('should delete the bytes of every file then the rows', async () => {
      mockServerFileRepository.findBy.mockResolvedValue([
        {
          id: 'file-1',
          path: 'application-registration/registration-id/manifest.json',
        },
        {
          id: 'file-2',
          path: 'application-registration/registration-id/nested/settings.json',
        },
      ] as FileEntity[]);

      await service.deleteByApplicationRegistrationId('registration-id');

      expect(mockServerFileRepository.findBy).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        workspaceId: IsNull(),
      });
      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'server/application-registration/registration-id',
        filename: 'manifest.json',
      });
      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'server/application-registration/registration-id/nested',
        filename: 'settings.json',
      });
      expect(mockServerFileRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        workspaceId: IsNull(),
      });
    });

    it('should still delete the rows when a bytes deletion fails', async () => {
      mockServerFileRepository.findBy.mockResolvedValue([
        {
          id: 'file-1',
          path: 'application-registration/registration-id/manifest.json',
        },
      ] as FileEntity[]);
      mockDriver.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await service.deleteByApplicationRegistrationId('registration-id');

      expect(mockServerFileRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
        workspaceId: IsNull(),
      });
    });
  });
});
