import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { type InstanceFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { INSTANCE_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/instance-file-storage-prefix.constant';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateStoragePathIsWithinInstanceScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-instance-scope-or-throw.util';
import { InstanceFileEntity } from 'src/engine/core-modules/file/entities/instance-file.entity';

export type InstanceResourceIdentifier = {
  fileFolder: InstanceFileFolder;
  resourcePath: string;
};

@Injectable()
export class InstanceFileStorageService {
  private readonly logger = new Logger(InstanceFileStorageService.name);

  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    @InjectRepository(InstanceFileEntity)
    private readonly instanceFileRepository: Repository<InstanceFileEntity>,
  ) {}

  private validateAndBuildInstanceFileStoragePathOrThrow({
    fileFolder,
    resourcePath,
  }: InstanceResourceIdentifier): {
    onStorageFilePath: string;
    filePath: string;
  } {
    const validationResult = validateFilePath({ resourcePath, fileFolder });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const filePath = join(fileFolder, resourcePath).replace(/\/+/g, '/');

    const onStorageFilePath = join(
      INSTANCE_FILE_STORAGE_PREFIX,
      filePath,
    ).replace(/\/+/g, '/');

    validateStoragePathIsWithinInstanceScopeOrThrow({
      onStoragePath: onStorageFilePath,
      fileFolder,
    });

    return { onStorageFilePath, filePath };
  }

  async writeInstanceFile({
    fileFolder,
    resourcePath,
    contents,
    mimeType,
    applicationRegistrationId,
  }: InstanceResourceIdentifier & {
    contents: Buffer | string;
    mimeType: string;
    applicationRegistrationId?: string;
  }): Promise<InstanceFileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath, filePath } =
      this.validateAndBuildInstanceFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    await driver.writeFile({
      filePath: onStorageFilePath,
      mimeType,
      sourceFile: contents,
    });

    await this.instanceFileRepository.upsert(
      {
        path: filePath,
        size:
          typeof contents === 'string'
            ? Buffer.byteLength(contents)
            : contents.length,
        mimeType,
        applicationRegistrationId: applicationRegistrationId ?? null,
      },
      { conflictPaths: ['path'] },
    );

    return this.instanceFileRepository.findOneByOrFail({ path: filePath });
  }

  readInstanceFile({
    fileFolder,
    resourcePath,
  }: InstanceResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildInstanceFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    return driver.readFile({ filePath: onStorageFilePath });
  }

  async readInstanceFileById(id: string): Promise<Readable> {
    const instanceFile = await this.findInstanceFileByIdOrThrow(id);

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.readFile({
      filePath: this.buildOnStorageFilePath(instanceFile),
    });
  }

  checkInstanceFileExists({
    fileFolder,
    resourcePath,
  }: InstanceResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildInstanceFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    return driver.checkFileExists({ filePath: onStorageFilePath });
  }

  async deleteInstanceFile({
    fileFolder,
    resourcePath,
  }: InstanceResourceIdentifier): Promise<void> {
    const { onStorageFilePath, filePath } =
      this.validateAndBuildInstanceFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    await this.deleteBytesBestEffort(onStorageFilePath);

    await this.instanceFileRepository.delete({ path: filePath });
  }

  async deleteByInstanceFileId(id: string): Promise<void> {
    const instanceFile = await this.findInstanceFileByIdOrThrow(id);

    await this.deleteBytesBestEffort(this.buildOnStorageFilePath(instanceFile));

    await this.instanceFileRepository.delete({ id });
  }

  async deleteByApplicationRegistrationId(
    applicationRegistrationId: string,
  ): Promise<void> {
    const instanceFiles = await this.instanceFileRepository.findBy({
      applicationRegistrationId,
    });

    for (const instanceFile of instanceFiles) {
      await this.deleteBytesBestEffort(
        this.buildOnStorageFilePath(instanceFile),
      );
    }

    await this.instanceFileRepository.delete({ applicationRegistrationId });
  }

  private async findInstanceFileByIdOrThrow(
    id: string,
  ): Promise<InstanceFileEntity> {
    const instanceFile = await this.instanceFileRepository.findOneBy({ id });

    if (!isDefined(instanceFile)) {
      throw new FileStorageException(
        `Instance file ${id} not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    return instanceFile;
  }

  private buildOnStorageFilePath(instanceFile: InstanceFileEntity): string {
    return join(INSTANCE_FILE_STORAGE_PREFIX, instanceFile.path);
  }

  private async deleteBytesBestEffort(
    onStorageFilePath: string,
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    try {
      await driver.delete({
        folderPath: dirname(onStorageFilePath),
        filename: basename(onStorageFilePath),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete instance file bytes at ${onStorageFilePath}: ${error}`,
      );
    }
  }
}
