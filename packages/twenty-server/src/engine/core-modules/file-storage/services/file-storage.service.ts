import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';
import { v4 } from 'uuid';

import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type FindOptionsWhere,
  Like,
  type QueryRunner,
  type UpdateResult,
} from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type ByteRange } from 'src/engine/core-modules/file-storage/types/byte-range.type';
import { type FileStorageMetadata } from 'src/engine/core-modules/file-storage/types/file-storage-metadata.type';
import { buildReleasedStockByApplication } from 'src/engine/core-modules/file-storage/utils/build-released-stock-by-application.util';
import { buildStockDelta } from 'src/engine/core-modules/file-storage/utils/build-stock-delta.util';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateFolderPath } from 'src/engine/core-modules/file-storage/utils/validate-folder-path.util';
import { validateStoragePathIsWithinWorkspaceOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-workspace-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_CONTENT_SNIFF_BYTE_COUNT } from 'src/engine/core-modules/file/file-upload/constants/file-content-sniff.constant';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { STOCK_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type StockScope } from 'src/engine/core-modules/usage-limit/types/stock-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
export type ResourceIdentifier = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  fileFolder: FileFolder;
  resourcePath: string;
};

@Injectable()
export class FileStorageService {
  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageLimitStockService: UsageLimitStockService,
  ) {}

  async releaseStorageStock({
    workspaceId,
    applicationId,
    bytes,
    quantity,
  }: {
    workspaceId: string;
    applicationId: string;
    bytes: number;
    quantity: number;
  }): Promise<void> {
    await this.usageLimitStockService.releaseStock({
      workspaceId,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId },
      cost: { bytes, quantity },
    });
  }

  async invalidateStorageStock({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId?: string;
  }): Promise<void> {
    await this.usageLimitStockService.invalidateStock({
      workspaceId,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId },
    });
  }

  private async assertStorageStockAvailable({
    workspaceId,
    applicationId,
    delta,
  }: {
    workspaceId: string;
    applicationId: string;
    delta: StockCost;
  }): Promise<void> {
    if (STOCK_METERS.every((meter) => (delta[meter] ?? 0) <= 0)) {
      return;
    }

    await this.usageLimitStockService.assertStockAvailable({
      workspaceId,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId },
      cost: delta,
      computeUsedStock: (scope) =>
        this.computeStorageUsedStock({ workspaceId, ...scope }),
    });
  }

  private async computeStorageUsedStock({
    workspaceId,
    spenderType,
    spenderId,
  }: StockScope & { workspaceId: string }): Promise<
    Record<StockMeter, number>
  > {
    const query = this.fileRepository
      .createQueryBuilder('file')
      .select('COUNT(*)::bigint', 'quantity')
      .addSelect('COALESCE(SUM(file.size), 0)::bigint', 'bytes')
      .where('file.workspaceId = :workspaceId', { workspaceId })
      .withDeleted();

    if (spenderType === 'application') {
      query.andWhere('file.applicationId = :applicationId', {
        applicationId: spenderId,
      });
    }

    const used = await query.getRawOne<{ quantity: string; bytes: string }>();

    return {
      quantity: Number(used?.quantity ?? 0),
      bytes: Number(used?.bytes ?? 0),
    };
  }

  private async deleteFileRows({
    workspaceId,
    where,
    fileRepository,
  }: {
    workspaceId: string;
    where: FindOptionsWhere<FileEntity>;
    fileRepository: WorkspaceScopedRepository<FileEntity>;
  }): Promise<void> {
    const deletedRows = await fileRepository.deleteAndReturn(
      workspaceId,
      where,
    );

    const releasedByApplication = buildReleasedStockByApplication(deletedRows);

    await Promise.all(
      [...releasedByApplication.entries()].map(([applicationId, released]) =>
        this.releaseStorageStock({ workspaceId, applicationId, ...released }),
      ),
    );
  }

  private findFileByPath({
    fileRepository,
    workspaceId,
    filePath,
    applicationId,
  }: {
    fileRepository: WorkspaceScopedRepository<FileEntity>;
    workspaceId: string;
    filePath: string;
    applicationId: string;
  }): Promise<FileEntity | null> {
    return fileRepository.findOne(workspaceId, {
      where: { path: filePath, applicationId },
      withDeleted: true,
    });
  }

  private async createFileRowFromStorageOrThrow({
    resourceIdentifier,
    filePath,
    applicationId,
  }: {
    resourceIdentifier: ResourceIdentifier;
    filePath: string;
    applicationId: string;
  }): Promise<Pick<FileEntity, 'mimeType' | 'size' | 'settings'>> {
    const metadata = await this.getFileMetadata(resourceIdentifier);

    if (!isDefined(metadata)) {
      throw new FileStorageException(
        `File not found at path "${filePath}"`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    const { mimeType } = await extractFileInfoOrThrow({
      file: await this.readFilePrefix({
        ...resourceIdentifier,
        byteCount: FILE_CONTENT_SNIFF_BYTE_COUNT,
      }),
      filename: resourceIdentifier.resourcePath,
    });

    const fileRow = {
      mimeType,
      size: metadata.size,
      settings: { isTemporaryFile: false, toDelete: false },
    };

    const insertResult = await this.fileRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...fileRow,
        workspaceId: resourceIdentifier.workspaceId,
        path: filePath,
        applicationId,
        status: FILE_STATUS.UPLOADED,
      })
      .orIgnore()
      .returning('id')
      .execute();

    if (isNonEmptyArray(insertResult.raw)) {
      await this.applyStorageStockDelta({
        workspaceId: resourceIdentifier.workspaceId,
        applicationId,
        delta: { bytes: metadata.size, quantity: 1 },
      });
    }

    return fileRow;
  }

  private async applyStorageStockDelta({
    workspaceId,
    applicationId,
    delta,
  }: {
    workspaceId: string;
    applicationId: string;
    delta: StockCost;
  }): Promise<void> {
    const scope = {
      workspaceId,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: { applicationId },
    };

    if ((delta.bytes ?? 0) < 0) {
      return this.releaseStorageStock({
        workspaceId,
        applicationId,
        bytes: -(delta.bytes ?? 0),
        quantity: 0,
      });
    }

    return this.usageLimitStockService.acquireStock({ ...scope, cost: delta });
  }

  private async resolveApplicationIdOrThrow({
    applicationUniversalIdentifier,
    workspaceId,
    queryRunner,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
    queryRunner?: QueryRunner;
  }): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const cachedApplication = findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      applicationUniversalIdentifier,
    );

    if (isDefined(cachedApplication)) {
      return cachedApplication.id;
    }

    if (isDefined(queryRunner)) {
      const application = await queryRunner.manager
        .getRepository(ApplicationEntity)
        .findOne({
          where: {
            universalIdentifier: applicationUniversalIdentifier,
            workspaceId,
          },
        });

      if (isDefined(application)) {
        return application.id;
      }
    }

    throw new FileStorageException(
      `Application with universalIdentifier "${applicationUniversalIdentifier}" not found`,
      FileStorageExceptionCode.FILE_NOT_FOUND,
    );
  }

  private async resolveApplicationUniversalIdentifierOrThrow({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const application = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );

    if (!isDefined(application)) {
      throw new FileStorageException(
        `Application with id "${applicationId}" not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    return application.universalIdentifier;
  }

  private buildStoragePathWithinWorkspaceOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
    fileFolder,
    relativePath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fileFolder: FileFolder;
    relativePath: string;
  }): { onStoragePath: string; resourcePath: string } {
    const resourcePath = join(fileFolder, relativePath).replace(/\/+/g, '/');

    const onStoragePath = join(
      workspaceId,
      applicationUniversalIdentifier,
      resourcePath,
    ).replace(/\/+/g, '/');

    validateStoragePathIsWithinWorkspaceOrThrow({
      onStoragePath,
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
    });

    return { onStoragePath, resourcePath };
  }

  private validateAndBuildFileStoragePathOrThrow(params: ResourceIdentifier): {
    onStorageFilePath: string;
    filePath: string;
  } {
    const validationResult = validateFilePath({
      resourcePath: params.resourcePath,
      fileFolder: params.fileFolder,
    });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const { onStoragePath, resourcePath } =
      this.buildStoragePathWithinWorkspaceOrThrow({
        ...params,
        relativePath: params.resourcePath,
      });

    return { onStorageFilePath: onStoragePath, filePath: resourcePath };
  }

  private validateAndBuildFolderStoragePathOrThrow(
    params: Omit<ResourceIdentifier, 'resourcePath'> & { folderPath: string },
  ): { onStorageFolderPath: string; folderPath: string } {
    const validationResult = validateFolderPath({
      folderPath: params.folderPath,
    });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const { onStoragePath, resourcePath } =
      this.buildStoragePathWithinWorkspaceOrThrow({
        ...params,
        relativePath: params.folderPath,
      });

    return {
      onStorageFolderPath: `${onStoragePath}/`,
      folderPath: `${resourcePath}/`,
    };
  }

  async writeFile({
    sourceFile,
    fileFolder,
    applicationUniversalIdentifier,
    applicationId,
    workspaceId,
    resourcePath,
    fileId,
    settings,
    queryRunner,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
    applicationId?: string;
    fileId?: string;
    settings: FileSettings;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const resolvedApplicationId =
      applicationId ??
      (await this.resolveApplicationIdOrThrow({
        applicationUniversalIdentifier,
        workspaceId,
        queryRunner,
      }));

    const fileRepository = isDefined(queryRunner)
      ? this.fileRepository.withManager(queryRunner.manager)
      : this.fileRepository;

    const { onStorageFilePath, filePath } =
      this.validateAndBuildFileStoragePathOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder,
        resourcePath,
      });

    const { sourceFile: persistedSourceFile, mimeType } =
      await prepareFileForStorageOrThrow({
        sourceFile,
        resourcePath,
      });

    const size = isString(persistedSourceFile)
      ? Buffer.byteLength(persistedSourceFile)
      : persistedSourceFile.length;

    const existingFile = await this.findFileByPath({
      fileRepository: fileRepository,
      workspaceId,
      filePath,
      applicationId: resolvedApplicationId,
    });

    const delta = buildStockDelta({ existingFile, size });

    await this.assertStorageStockAvailable({
      workspaceId,
      applicationId: resolvedApplicationId,
      delta,
    });

    await driver.writeFile({
      filePath: onStorageFilePath,
      mimeType,
      sourceFile: persistedSourceFile,
    });

    const file = await fileRepository.upsertAndReturnOne(
      workspaceId,
      {
        path: filePath,
        applicationId: resolvedApplicationId,
        id: existingFile?.id ?? fileId,
        mimeType,
        size,
        settings,
      },
      ['path', 'workspaceId', 'applicationId'],
    );

    await this.applyStorageStockDelta({
      workspaceId,
      applicationId: resolvedApplicationId,
      delta,
    });

    return file;
  }

  // Creates the file record ahead of a direct client upload. The bytes are
  // not in storage yet: the record stays PENDING until the upload is
  // confirmed (completeFileUpload) or reaped by the cleanup cron.
  async createPendingFile({
    fileFolder,
    applicationUniversalIdentifier,
    applicationId,
    workspaceId,
    resourcePath,
    fileId,
    size,
    mimeType,
    settings,
  }: ResourceIdentifier & {
    applicationId?: string;
    fileId: string;
    size: number;
    mimeType: string;
    settings: FileSettings;
  }): Promise<FileEntity> {
    const resolvedApplicationId =
      applicationId ??
      (await this.resolveApplicationIdOrThrow({
        applicationUniversalIdentifier,
        workspaceId,
      }));

    const { filePath } = this.validateAndBuildFileStoragePathOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      resourcePath,
    });

    const existingFile = await this.findFileByPath({
      fileRepository: this.fileRepository,
      workspaceId,
      filePath,
      applicationId: resolvedApplicationId,
    });

    const delta = buildStockDelta({ existingFile, size });

    await this.assertStorageStockAvailable({
      workspaceId,
      applicationId: resolvedApplicationId,
      delta,
    });

    const file = await this.fileRepository.upsertAndReturnOne(
      workspaceId,
      {
        path: filePath,
        applicationId: resolvedApplicationId,
        id: existingFile?.id ?? fileId,
        mimeType,
        size,
        settings,
        status: FILE_STATUS.PENDING,
      },
      ['path', 'workspaceId', 'applicationId'],
    );

    await this.applyStorageStockDelta({
      workspaceId,
      applicationId: resolvedApplicationId,
      delta,
    });

    return file;
  }

  async markFileUploaded({
    workspaceId,
    applicationId,
    fileId,
    chargedSize,
    size,
    mimeType,
  }: {
    workspaceId: string;
    applicationId: string;
    fileId: string;
    chargedSize: number;
    size: number;
    mimeType: string;
  }): Promise<UpdateResult> {
    const updateResult = await this.fileRepository.update(
      workspaceId,
      { id: fileId },
      { status: FILE_STATUS.UPLOADED, mimeType, size },
    );

    if (updateResult.affected === 0 || size === chargedSize) {
      return updateResult;
    }

    await this.applyStorageStockDelta({
      workspaceId,
      applicationId,
      delta: { bytes: size - chargedSize, quantity: 0 },
    });

    return updateResult;
  }

  async writeFileStream(
    params: ResourceIdentifier & {
      stream: Readable;
      mimeType: string | undefined;
    },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.writeFileStream({
      filePath: onStorageFilePath,
      stream: params.stream,
      mimeType: params.mimeType,
    });
  }

  async getFileMetadata(
    params: ResourceIdentifier,
  ): Promise<FileStorageMetadata | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getFileMetadata({ filePath: onStorageFilePath });
  }

  async getPresignedUploadUrl(
    params: ResourceIdentifier & {
      contentType: string;
      contentLength: number;
      expiresInSeconds?: number;
    },
  ): Promise<string | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getPresignedUploadUrl({
      filePath: onStorageFilePath,
      contentType: params.contentType,
      contentLength: params.contentLength,
      expiresInSeconds: params.expiresInSeconds,
    });
  }

  async getPresignedUrl(
    params: ResourceIdentifier & {
      expiresInSeconds?: number;
      responseContentType?: string;
      responseContentDisposition?: string;
      responseCacheControl?: string;
    },
  ): Promise<string | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getPresignedUrl({
      filePath: onStorageFilePath,
      expiresInSeconds: params.expiresInSeconds,
      responseContentType: params.responseContentType,
      responseContentDisposition: params.responseContentDisposition,
      responseCacheControl: params.responseCacheControl,
    });
  }

  readFile(
    params: ResourceIdentifier & { byteRange?: ByteRange },
  ): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.readFile({
      filePath: onStorageFilePath,
      byteRange: params.byteRange,
    });
  }

  readFilePrefix(
    params: ResourceIdentifier & { byteCount: number },
  ): Promise<Buffer> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.readFilePrefix({
      filePath: onStorageFilePath,
      byteCount: params.byteCount,
    });
  }

  downloadFile(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.downloadFile({
      onStoragePath: onStorageFilePath,
      localPath: params.localPath,
    });
  }

  async deleteApplicationFileRows({
    applicationId,
    workspaceId,
    queryRunner,
  }: {
    applicationId: string;
    workspaceId: string;
    queryRunner?: QueryRunner;
  }) {
    const fileRepository = queryRunner
      ? this.fileRepository.withManager(queryRunner.manager)
      : this.fileRepository;

    await this.deleteFileRows({
      workspaceId,
      where: { applicationId },
      fileRepository,
    });
  }

  async deleteApplicationFilesFromStorage({
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }) {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${workspaceId}/${applicationUniversalIdentifier}/`,
    });
  }

  async deleteFile(
    params: ResourceIdentifier & { applicationId?: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath, filePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    await driver.delete({
      folderPath: dirname(onStorageFilePath),
      filename: basename(onStorageFilePath),
    });

    const applicationId =
      params.applicationId ??
      (await this.resolveApplicationIdOrThrow({
        applicationUniversalIdentifier: params.applicationUniversalIdentifier,
        workspaceId: params.workspaceId,
      }));

    await this.deleteFileRows({
      workspaceId: params.workspaceId,
      where: { path: filePath, applicationId },
      fileRepository: this.fileRepository,
    });
  }

  // Removes only the stored object. deleteFile also drops any row sitting at
  // that path, which is wrong once the row is gone or belongs to a later
  // upload that reused the same resource path.
  async deleteFileObject(params: ResourceIdentifier): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    await driver.delete({
      folderPath: dirname(onStorageFilePath),
      filename: basename(onStorageFilePath),
    });
  }

  async deleteFolder(
    params: Omit<ResourceIdentifier, 'resourcePath'> & {
      folderPath: string;
    },
  ): Promise<void> {
    const {
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      folderPath,
    } = params;

    const { onStorageFolderPath, folderPath: validatedFolderPath } =
      this.validateAndBuildFolderStoragePathOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder,
        folderPath,
      });

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({ folderPath: onStorageFolderPath });

    const applicationId = await this.resolveApplicationIdOrThrow({
      applicationUniversalIdentifier,
      workspaceId,
    });

    await this.deleteFileRows({
      workspaceId,
      where: { path: Like(`${validatedFolderPath}%`), applicationId },
      fileRepository: this.fileRepository,
    });
  }

  async deleteByFileId({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${fileFolder}/%`),
      },
    });

    const applicationUniversalIdentifier =
      await this.resolveApplicationUniversalIdentifierOrThrow({
        applicationId: file.applicationId,
        workspaceId,
      });

    await this.deleteFile({
      workspaceId,
      applicationUniversalIdentifier,
      applicationId: file.applicationId,
      fileFolder,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });
  }

  async checkIfWorkspaceFolderExists(workspaceId: string): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFolderExists({ folderPath: workspaceId });
  }

  async deleteWorkspaceFolder(workspaceId: string): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({ folderPath: workspaceId });
  }

  copyLegacy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
  }

  async copyFile({
    from,
    to,
    applicationId,
    fileId,
    size,
    mimeType,
    settings,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
    applicationId: string;
    fileId: string;
    size: number;
    mimeType: string;
    settings: FileSettings | null;
  }): Promise<FileEntity> {
    const { filePath } = this.validateAndBuildFileStoragePathOrThrow(to);
    const delta = { bytes: size, quantity: 1 };

    await this.assertStorageStockAvailable({
      workspaceId: to.workspaceId,
      applicationId,
      delta,
    });

    await this.copy({ from, to });

    const file = await this.fileRepository.insertAndReturnOne(to.workspaceId, {
      id: fileId,
      path: filePath,
      applicationId,
      mimeType,
      size,
      status: FILE_STATUS.UPLOADED,
      settings,
    });

    await this.applyStorageStockDelta({
      workspaceId: to.workspaceId,
      applicationId,
      delta,
    });

    return file;
  }

  async copyFileByPath({
    from,
    to,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
  }): Promise<FileEntity> {
    const { filePath } = this.validateAndBuildFileStoragePathOrThrow(from);

    const [sourceApplicationId, destinationApplicationId] = await Promise.all([
      this.resolveApplicationIdOrThrow(from),
      this.resolveApplicationIdOrThrow(to),
    ]);

    let sourceFile: Pick<FileEntity, 'mimeType' | 'size' | 'settings'> | null =
      await this.findFileByPath({
        fileRepository: this.fileRepository,
        workspaceId: from.workspaceId,
        filePath,
        applicationId: sourceApplicationId,
      });

    if (!isDefined(sourceFile)) {
      sourceFile = await this.createFileRowFromStorageOrThrow({
        resourceIdentifier: from,
        filePath,
        applicationId: sourceApplicationId,
      });
    }

    return this.copyFile({
      from,
      to,
      applicationId: destinationApplicationId,
      fileId: v4(),
      mimeType: sourceFile.mimeType,
      size: sourceFile.size,
      settings: sourceFile.settings,
    });
  }

  private async copy({
    from,
    to,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath: fromPath } =
      this.validateAndBuildFileStoragePathOrThrow(from);
    const { onStorageFilePath: toPath } =
      this.validateAndBuildFileStoragePathOrThrow(to);

    const isFile = await driver.checkFileExists({ filePath: fromPath });

    if (isFile) {
      return driver.copy({
        from: { folderPath: dirname(fromPath), filename: basename(fromPath) },
        to: { folderPath: dirname(toPath), filename: basename(toPath) },
      });
    }

    return driver.copy({
      from: { folderPath: fromPath },
      to: { folderPath: toPath },
    });
  }

  async move({
    from,
    to,
    ifMatchChecksum,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
    ifMatchChecksum?: string;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath: fromPath } =
      this.validateAndBuildFileStoragePathOrThrow(from);
    const { onStorageFilePath: toPath } =
      this.validateAndBuildFileStoragePathOrThrow(to);

    return driver.move({
      from: { folderPath: dirname(fromPath), filename: basename(fromPath) },
      to: { folderPath: dirname(toPath), filename: basename(toPath) },
      ifMatchChecksum,
    });
  }

  checkFileExists(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.checkFileExists({ filePath: onStorageFilePath });
  }
}
