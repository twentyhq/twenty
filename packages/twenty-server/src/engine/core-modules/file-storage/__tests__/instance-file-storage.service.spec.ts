import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Readable } from 'stream';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { InstanceFileStorageService } from 'src/engine/core-modules/file-storage/instance-file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { InstanceFileEntity } from 'src/engine/core-modules/file/entities/instance-file.entity';

describe('InstanceFileStorageService', () => {
  let service: InstanceFileStorageService;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  const mockInstanceFileRepository = {
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
        InstanceFileStorageService,
        {
          provide: FileStorageDriverFactory,
          useValue: mockFileStorageDriverFactory,
        },
        {
          provide: getRepositoryToken(InstanceFileEntity),
          useValue: mockInstanceFileRepository,
        },
      ],
    }).compile();

    service = module.get<InstanceFileStorageService>(
      InstanceFileStorageService,
    );

    jest.clearAllMocks();

    mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
  });

  describe('writeInstanceFile', () => {
    it('should write bytes with the instance prefix and upsert the row on path conflict', async () => {
      const instanceFile = {
        id: 'instance-file-id',
        path: 'application-manifest/manifests/manifest.json',
      } as InstanceFileEntity;

      mockInstanceFileRepository.findOneByOrFail.mockResolvedValue(
        instanceFile,
      );

      const result = await service.writeInstanceFile({
        fileFolder: 'application-manifest',
        resourcePath: 'manifests/manifest.json',
        contents: '{"name":"my-app"}',
        mimeType: 'application/json',
        applicationRegistrationId: 'registration-id',
      });

      expect(mockDriver.writeFile).toHaveBeenCalledWith({
        filePath: 'instance/application-manifest/manifests/manifest.json',
        mimeType: 'application/json',
        sourceFile: '{"name":"my-app"}',
      });
      expect(mockInstanceFileRepository.upsert).toHaveBeenCalledWith(
        {
          path: 'application-manifest/manifests/manifest.json',
          size: Buffer.byteLength('{"name":"my-app"}'),
          mimeType: 'application/json',
          applicationRegistrationId: 'registration-id',
        },
        { conflictPaths: ['path'] },
      );
      expect(result).toEqual(instanceFile);
    });

    it('should store a null applicationRegistrationId when none is provided', async () => {
      mockInstanceFileRepository.findOneByOrFail.mockResolvedValue(
        {} as InstanceFileEntity,
      );

      await service.writeInstanceFile({
        fileFolder: 'application-manifest',
        resourcePath: 'manifest.json',
        contents: Buffer.from('{}'),
        mimeType: 'application/json',
      });

      expect(mockInstanceFileRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ applicationRegistrationId: null, size: 2 }),
        { conflictPaths: ['path'] },
      );
    });

    it('should reject a traversal resource path without touching storage', async () => {
      await expect(
        service.writeInstanceFile({
          fileFolder: 'application-manifest',
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
      expect(mockInstanceFileRepository.upsert).not.toHaveBeenCalled();
    });

    it('should propagate driver write failures without upserting the row', async () => {
      mockDriver.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(
        service.writeInstanceFile({
          fileFolder: 'application-manifest',
          resourcePath: 'manifest.json',
          contents: '{}',
          mimeType: 'application/json',
        }),
      ).rejects.toThrow('Write failed');

      expect(mockInstanceFileRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('readInstanceFile', () => {
    it('should read from the instance-prefixed storage path', async () => {
      const stream = Readable.from(['{}']);

      mockDriver.readFile.mockResolvedValue(stream);

      const result = await service.readInstanceFile({
        fileFolder: 'application-manifest',
        resourcePath: 'manifests/manifest.json',
      });

      expect(mockDriver.readFile).toHaveBeenCalledWith({
        filePath: 'instance/application-manifest/manifests/manifest.json',
      });
      expect(result).toBe(stream);
    });

    it('should propagate the missing-file exception from the driver', async () => {
      mockDriver.readFile.mockRejectedValueOnce(
        new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        ),
      );

      await expect(
        service.readInstanceFile({
          fileFolder: 'application-manifest',
          resourcePath: 'missing.json',
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.FILE_NOT_FOUND,
        }),
      );
    });
  });

  describe('readInstanceFileById', () => {
    it('should read the bytes of the row storage path', async () => {
      const stream = Readable.from(['{}']);

      mockInstanceFileRepository.findOneBy.mockResolvedValue({
        id: 'instance-file-id',
        path: 'application-manifest/manifest.json',
      } as InstanceFileEntity);
      mockDriver.readFile.mockResolvedValue(stream);

      const result = await service.readInstanceFileById('instance-file-id');

      expect(mockInstanceFileRepository.findOneBy).toHaveBeenCalledWith({
        id: 'instance-file-id',
      });
      expect(mockDriver.readFile).toHaveBeenCalledWith({
        filePath: 'instance/application-manifest/manifest.json',
      });
      expect(result).toBe(stream);
    });

    it('should throw a missing-file exception when the row does not exist', async () => {
      mockInstanceFileRepository.findOneBy.mockResolvedValue(null);

      await expect(service.readInstanceFileById('unknown-id')).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.FILE_NOT_FOUND,
        }),
      );

      expect(mockDriver.readFile).not.toHaveBeenCalled();
    });
  });

  describe('checkInstanceFileExists', () => {
    it('should check existence on the instance-prefixed storage path', async () => {
      mockDriver.checkFileExists.mockResolvedValue(true);

      const result = await service.checkInstanceFileExists({
        fileFolder: 'application-manifest',
        resourcePath: 'manifest.json',
      });

      expect(mockDriver.checkFileExists).toHaveBeenCalledWith({
        filePath: 'instance/application-manifest/manifest.json',
      });
      expect(result).toBe(true);
    });
  });

  describe('deleteInstanceFile', () => {
    it('should delete the bytes and the row', async () => {
      await service.deleteInstanceFile({
        fileFolder: 'application-manifest',
        resourcePath: 'manifests/manifest.json',
      });

      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'instance/application-manifest/manifests',
        filename: 'manifest.json',
      });
      expect(mockInstanceFileRepository.delete).toHaveBeenCalledWith({
        path: 'application-manifest/manifests/manifest.json',
      });
    });

    it('should still delete the row when the bytes deletion fails', async () => {
      mockDriver.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await service.deleteInstanceFile({
        fileFolder: 'application-manifest',
        resourcePath: 'manifest.json',
      });

      expect(mockInstanceFileRepository.delete).toHaveBeenCalledWith({
        path: 'application-manifest/manifest.json',
      });
    });

    it('should propagate row deletion failures', async () => {
      mockInstanceFileRepository.delete.mockRejectedValueOnce(
        new Error('Row deletion failed'),
      );

      await expect(
        service.deleteInstanceFile({
          fileFolder: 'application-manifest',
          resourcePath: 'manifest.json',
        }),
      ).rejects.toThrow('Row deletion failed');
    });
  });

  describe('deleteByInstanceFileId', () => {
    it('should delete the bytes and the row of the given id', async () => {
      mockInstanceFileRepository.findOneBy.mockResolvedValue({
        id: 'instance-file-id',
        path: 'application-manifest/manifest.json',
      } as InstanceFileEntity);

      await service.deleteByInstanceFileId('instance-file-id');

      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'instance/application-manifest',
        filename: 'manifest.json',
      });
      expect(mockInstanceFileRepository.delete).toHaveBeenCalledWith({
        id: 'instance-file-id',
      });
    });

    it('should throw a missing-file exception when the row does not exist', async () => {
      mockInstanceFileRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.deleteByInstanceFileId('unknown-id'),
      ).rejects.toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.FILE_NOT_FOUND,
        }),
      );

      expect(mockInstanceFileRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteByApplicationRegistrationId', () => {
    it('should delete the bytes of every file then the rows', async () => {
      mockInstanceFileRepository.findBy.mockResolvedValue([
        { id: 'file-1', path: 'application-manifest/manifest.json' },
        { id: 'file-2', path: 'application-manifest/nested/settings.json' },
      ] as InstanceFileEntity[]);

      await service.deleteByApplicationRegistrationId('registration-id');

      expect(mockInstanceFileRepository.findBy).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
      });
      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'instance/application-manifest',
        filename: 'manifest.json',
      });
      expect(mockDriver.delete).toHaveBeenCalledWith({
        folderPath: 'instance/application-manifest/nested',
        filename: 'settings.json',
      });
      expect(mockInstanceFileRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
      });
    });

    it('should still delete the rows when a bytes deletion fails', async () => {
      mockInstanceFileRepository.findBy.mockResolvedValue([
        { id: 'file-1', path: 'application-manifest/manifest.json' },
      ] as InstanceFileEntity[]);
      mockDriver.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await service.deleteByApplicationRegistrationId('registration-id');

      expect(mockInstanceFileRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: 'registration-id',
      });
    });
  });
});
