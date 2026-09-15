import { type QueryRunner } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';

import { type FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const APPLICATION_ID = 'b30a4560-fedb-4ccd-904a-3788762c7d33';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'b30a4560-fedb-4ccd-904a-3788762c7d33';

describe('FileStorageService', () => {
  const buildService = (existingFile: Partial<FileEntity> | null) => {
    const transactionRepository = {
      findOne: jest.fn().mockResolvedValue(existingFile),
      upsertAndReturnOne: jest
        .fn()
        .mockImplementation((_workspaceId, entity) => entity),
    };

    const fileRepository = {
      findOne: jest.fn().mockResolvedValue(existingFile),
      upsertAndReturnOne: jest
        .fn()
        .mockImplementation((_workspaceId, entity) => entity),
      withManager: jest.fn().mockReturnValue(transactionRepository),
    };

    const driver = { writeFile: jest.fn().mockResolvedValue(undefined) };

    const service = new FileStorageService(
      {
        getCurrentDriver: () => driver,
      } as unknown as FileStorageDriverFactory,
      fileRepository as unknown as WorkspaceScopedRepository<FileEntity>,
      {} as WorkspaceCacheService,
    );

    return { service, fileRepository, transactionRepository };
  };

  const writeFile = (
    service: FileStorageService,
    fileId: string,
    queryRunner?: QueryRunner,
  ) =>
    service.writeFile({
      sourceFile: '{}',
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      resourcePath: 'package.json',
      fileId,
      settings: { isTemporaryFile: false, toDelete: false },
      queryRunner,
    });

  const createPendingFile = (service: FileStorageService, fileId: string) =>
    service.createPendingFile({
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      resourcePath: 'package.json',
      fileId,
      size: 12,
      mimeType: 'application/json',
      settings: { isTemporaryFile: false, toDelete: false },
    });

  it('should keep the identifier of the row already stored at that path', async () => {
    const { service, fileRepository } = buildService({
      id: 'the-row-the-application-points-at',
    });

    await createPendingFile(service, 'a-freshly-generated-identifier');

    expect(fileRepository.findOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: 'the-row-the-application-points-at' }),
      ['path', 'workspaceId', 'applicationId'],
    );
  });

  it('should look the row up including soft-deleted ones, which the unique index still matches', async () => {
    const { service, fileRepository } = buildService(null);

    await createPendingFile(service, 'a-freshly-generated-identifier');

    expect(fileRepository.findOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.findOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ withDeleted: true }),
    );
  });

  it('should use the generated identifier when no row is stored at that path', async () => {
    const { service, fileRepository } = buildService(null);

    await createPendingFile(service, 'a-freshly-generated-identifier');

    expect(fileRepository.findOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: 'a-freshly-generated-identifier' }),
      ['path', 'workspaceId', 'applicationId'],
    );
  });

  it('should keep the stored identifier when writing the file content again', async () => {
    const { service, fileRepository } = buildService({
      id: 'the-row-the-application-points-at',
    });

    await writeFile(service, 'a-freshly-generated-identifier');

    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.upsertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: 'the-row-the-application-points-at' }),
      ['path', 'workspaceId', 'applicationId'],
    );
  });

  it('should look the row up through the transaction when one is given', async () => {
    const { service, fileRepository, transactionRepository } = buildService({
      id: 'the-row-the-application-points-at',
    });
    const queryRunner = { manager: {} } as QueryRunner;

    await writeFile(service, 'a-freshly-generated-identifier', queryRunner);

    expect(transactionRepository.findOne).toHaveBeenCalledTimes(1);
    expect(fileRepository.findOne).not.toHaveBeenCalled();
    expect(transactionRepository.upsertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: 'the-row-the-application-points-at' }),
      ['path', 'workspaceId', 'applicationId'],
    );
  });
});
