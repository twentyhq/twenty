import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { type Manifest } from 'twenty-shared/application';
import { ServerFileFolder } from 'twenty-shared/types';

import { ApplicationManifestStorageService } from 'src/engine/core-modules/application/application-registration/application-manifest-storage.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

describe('ApplicationManifestStorageService', () => {
  let service: ApplicationManifestStorageService;
  let serverFileStorageService: jest.Mocked<
    Pick<ServerFileStorageService, 'writeServerFile' | 'readServerFileById'>
  >;

  const applicationRegistrationId = 'a3d8e9f0-1234-4b5c-8d6e-7f8a9b0c1d2e';
  const serverFileId = 'b4e9f0a1-5678-4c6d-9e7f-8a9b0c1d2e3f';
  const manifest = {
    application: { displayName: 'Test App' },
  } as unknown as Manifest;

  beforeEach(async () => {
    serverFileStorageService = {
      writeServerFile: jest.fn(),
      readServerFileById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationManifestStorageService,
        {
          provide: ServerFileStorageService,
          useValue: serverFileStorageService,
        },
      ],
    }).compile();

    service = module.get(ApplicationManifestStorageService);

    jest.clearAllMocks();
  });

  describe('writeManifest', () => {
    it('should write the serialized manifest as an instance file and return it', async () => {
      const serverFile = { id: serverFileId } as FileEntity;

      serverFileStorageService.writeServerFile.mockResolvedValue(serverFile);

      const result = await service.writeManifest({
        applicationRegistrationId,
        manifest,
        sourceType: ApplicationRegistrationSourceType.NPM,
        version: '2.0.0',
      });

      expect(result).toBe(serverFile);
      expect(serverFileStorageService.writeServerFile).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        resourcePath: `${applicationRegistrationId}/manifests/2.0.0.json`,
        contents: JSON.stringify(manifest),
        mimeType: 'application/json',
        applicationRegistrationId,
      });
    });

    it('should write to the dev path when source type is LOCAL', async () => {
      serverFileStorageService.writeServerFile.mockResolvedValue({
        id: serverFileId,
      } as FileEntity);

      await service.writeManifest({
        applicationRegistrationId,
        manifest,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        version: '2.0.0',
      });

      expect(serverFileStorageService.writeServerFile).toHaveBeenCalledWith(
        expect.objectContaining({
          resourcePath: `${applicationRegistrationId}/manifests/dev.json`,
        }),
      );
    });

    it('should throw when the instance file write fails', async () => {
      serverFileStorageService.writeServerFile.mockRejectedValue(
        new Error('storage unavailable'),
      );

      await expect(
        service.writeManifest({
          applicationRegistrationId,
          manifest,
          sourceType: ApplicationRegistrationSourceType.NPM,
          version: '2.0.0',
        }),
      ).rejects.toThrow('storage unavailable');
    });
  });

  describe('readManifest', () => {
    it('should read and parse the manifest from the instance file', async () => {
      serverFileStorageService.readServerFileById.mockResolvedValue(
        Readable.from([Buffer.from(JSON.stringify(manifest), 'utf-8')]),
      );

      await expect(service.readManifest(serverFileId)).resolves.toEqual(
        manifest,
      );
      expect(serverFileStorageService.readServerFileById).toHaveBeenCalledWith(
        serverFileId,
      );
    });

    it('should return null when the instance file is not found', async () => {
      serverFileStorageService.readServerFileById.mockRejectedValue(
        new FileStorageException(
          'not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        ),
      );

      await expect(service.readManifest(serverFileId)).resolves.toBeNull();
    });

    it('should rethrow unexpected read failures', async () => {
      serverFileStorageService.readServerFileById.mockRejectedValue(
        new Error('storage unavailable'),
      );

      await expect(service.readManifest(serverFileId)).rejects.toThrow(
        'storage unavailable',
      );
    });

    it('should throw when the stored content is not valid JSON', async () => {
      serverFileStorageService.readServerFileById.mockResolvedValue(
        Readable.from([Buffer.from('not-json', 'utf-8')]),
      );

      await expect(service.readManifest(serverFileId)).rejects.toThrow();
    });
  });
});
