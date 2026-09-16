import { type QueryRunner } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';

import { type FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { type ComputeUsedStock } from 'src/engine/core-modules/usage-limit/types/compute-used-stock.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

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
      deleteAndReturn: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };

    const driver = {
      writeFile: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const usageLimitStockService = {
      assertStockAvailable: jest.fn().mockResolvedValue(undefined),
      acquireStock: jest.fn().mockResolvedValue(undefined),
      releaseStock: jest.fn().mockResolvedValue(undefined),
    };

    const service = new FileStorageService(
      {
        getCurrentDriver: () => driver,
      } as unknown as FileStorageDriverFactory,
      fileRepository as unknown as WorkspaceScopedRepository<FileEntity>,
      {} as WorkspaceCacheService,
      usageLimitStockService as unknown as UsageLimitStockService,
    );

    return {
      service,
      fileRepository,
      transactionRepository,
      usageLimitStockService,
    };
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

  const writeEmptyFile = (service: FileStorageService, fileId: string) =>
    service.writeFile({
      sourceFile: '',
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      resourcePath: 'package.json',
      fileId,
      settings: { isTemporaryFile: false, toDelete: false },
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

  it('should give back the stock the delete actually removed', async () => {
    const { service, fileRepository, usageLimitStockService } =
      buildService(null);

    fileRepository.deleteAndReturn.mockResolvedValue([
      { size: 1000, applicationId: APPLICATION_ID },
      { size: 2000, applicationId: APPLICATION_ID },
      { size: 40, applicationId: 'another-application' },
    ]);

    await service.deleteFile({
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      resourcePath: 'package.json',
    });

    expect(fileRepository.deleteAndReturn).toHaveBeenCalledWith(WORKSPACE_ID, {
      path: `${FileFolder.Dependencies}/package.json`,
      applicationId: APPLICATION_ID,
    });
    expect(usageLimitStockService.releaseStock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      cost: { bytes: 3000, quantity: 2 },
    });
    expect(usageLimitStockService.releaseStock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: 'another-application' },
      cost: { bytes: 40, quantity: 1 },
    });
  });

  it('should not move the stock when the delete removed nothing', async () => {
    const { service, usageLimitStockService } = buildService(null);

    await service.deleteFile({
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      resourcePath: 'package.json',
    });

    expect(usageLimitStockService.releaseStock).not.toHaveBeenCalled();
  });

  it('should refuse a write the stock cannot take, before any bytes land', async () => {
    const { service, usageLimitStockService, fileRepository } =
      buildService(null);
    const driver = { writeFile: jest.fn(), delete: jest.fn() };

    usageLimitStockService.assertStockAvailable.mockRejectedValue(
      new Error('stock exhausted'),
    );

    await expect(
      writeFile(service, 'a-freshly-generated-identifier'),
    ).rejects.toThrow('stock exhausted');

    expect(usageLimitStockService.assertStockAvailable).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      computeUsedStock: expect.any(Function),
      cost: { bytes: 2, quantity: 1 },
    });
    expect(driver.writeFile).not.toHaveBeenCalled();
    expect(fileRepository.upsertAndReturnOne).not.toHaveBeenCalled();
  });

  it('should gate an empty file on the stock, which still holds a row', async () => {
    const { service, usageLimitStockService } = buildService(null);

    await writeEmptyFile(service, 'a-freshly-generated-identifier');

    expect(usageLimitStockService.assertStockAvailable).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      computeUsedStock: expect.any(Function),
      cost: { bytes: 0, quantity: 1 },
    });
  });

  it('should gate a pending file on the stock as well', async () => {
    const { service, usageLimitStockService } = buildService(null);

    await createPendingFile(service, 'a-freshly-generated-identifier');

    expect(usageLimitStockService.assertStockAvailable).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      computeUsedStock: expect.any(Function),
      cost: { bytes: 12, quantity: 1 },
    });
  });

  it('should only charge the difference when a write replaces a row', async () => {
    const { service, usageLimitStockService } = buildService({
      id: 'the-row-already-at-that-path',
      size: 500,
    });

    await writeFile(service, 'a-freshly-generated-identifier');

    // '{}' is 2 bytes replacing 500, so the workspace ends up 498 lighter
    expect(usageLimitStockService.assertStockAvailable).not.toHaveBeenCalled();
    expect(usageLimitStockService.releaseStock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      cost: { bytes: 498, quantity: 0 },
    });
    expect(usageLimitStockService.acquireStock).not.toHaveBeenCalled();
  });

  it('should charge a growing replacement only for what it adds', async () => {
    const { service, usageLimitStockService } = buildService({
      id: 'the-row-already-at-that-path',
      size: 1,
    });

    await writeFile(service, 'a-freshly-generated-identifier');

    expect(usageLimitStockService.assertStockAvailable).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      computeUsedStock: expect.any(Function),
      cost: { bytes: 1, quantity: 0 },
    });
    expect(usageLimitStockService.acquireStock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId: APPLICATION_ID },
      cost: { bytes: 1, quantity: 0 },
    });
  });

  describe('recount handed to the stock', () => {
    const buildQueryBuilder = () => {
      const queryBuilder = {
        select: jest.fn(),
        addSelect: jest.fn(),
        where: jest.fn(),
        withDeleted: jest.fn(),
        andWhere: jest.fn(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ quantity: '3', bytes: '1024' }),
      };

      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.addSelect.mockReturnValue(queryBuilder);
      queryBuilder.where.mockReturnValue(queryBuilder);
      queryBuilder.withDeleted.mockReturnValue(queryBuilder);
      queryBuilder.andWhere.mockReturnValue(queryBuilder);

      return queryBuilder;
    };

    const buildServiceWithRecount = async () => {
      const { service, usageLimitStockService, fileRepository } =
        buildService(null);
      const queryBuilder = buildQueryBuilder();

      fileRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await writeFile(service, 'a-freshly-generated-identifier');

      const [{ computeUsedStock }] = usageLimitStockService.assertStockAvailable
        .mock.calls[0] as [{ computeUsedStock: ComputeUsedStock }];

      return { computeUsedStock, queryBuilder };
    };

    it('should count every row of the workspace, soft-deleted ones included', async () => {
      const { computeUsedStock, queryBuilder } =
        await buildServiceWithRecount();

      await expect(
        computeUsedStock({ spenderType: 'workspace', spenderId: null }),
      ).resolves.toEqual({ quantity: 3, bytes: 1024 });

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'file.workspaceId = :workspaceId',
        { workspaceId: WORKSPACE_ID },
      );
      expect(queryBuilder.withDeleted).toHaveBeenCalledTimes(1);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should narrow the recount to the application the limit is scoped to', async () => {
      const { computeUsedStock, queryBuilder } =
        await buildServiceWithRecount();

      await computeUsedStock({
        spenderType: 'application',
        spenderId: APPLICATION_ID,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'file.applicationId = :applicationId',
        { applicationId: APPLICATION_ID },
      );
    });
  });
});
