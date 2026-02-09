import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { mkdir, readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { type Readable } from 'stream';

import { isObject } from '@sniptt/guards';
import { FileFolder, Sources } from 'twenty-shared/types';
import { Like, Repository, type QueryRunner } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';

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
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  private buildOnStoragePath({
    workspaceId,
    applicationUniversalIdentifier,
    fileFolder,
    resourcePath,
  }: ResourceIdentifier): string {
    return join(
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      resourcePath,
    ).replace(/\/+/g, '/');
  }

  writeFileLegacy(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    const { file, name, folder, mimeType } = params;

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.writeFile({
      filePath: `${folder}/${name}`,
      sourceFile: file,
      mimeType,
    });
  }

  async writeFile({
    sourceFile,
    mimeType,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    fileId,
    settings,
    queryRunner,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
    mimeType: string | undefined;
    fileId?: string;
    settings: FileSettings;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const applicationRepository = queryRunner
      ? queryRunner.manager.getRepository(ApplicationEntity)
      : this.applicationRepository;
    const fileRepository = queryRunner
      ? queryRunner.manager.getRepository(FileEntity)
      : this.fileRepository;

    const application = await applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    });

    const onStoragePath = this.buildOnStoragePath({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      resourcePath,
    });

    await driver.writeFile({
      filePath: onStoragePath,
      mimeType,
      sourceFile,
    });

    await fileRepository.upsert(
      {
        path: `${fileFolder}/${resourcePath}`,
        workspaceId,
        applicationId: application.id,
        id: fileId,
        size:
          typeof sourceFile === 'string'
            ? Buffer.byteLength(sourceFile)
            : sourceFile.length,
        settings,
      },
      ['path', 'workspaceId', 'applicationId'],
    );

    return await fileRepository.findOneOrFail({
      where: {
        path: `${fileFolder}/${resourcePath}`,
        applicationId: application.id,
        workspaceId,
      },
    });
  }

  readFileLegacy(params: { filePath: string }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.readFile(params);
  }

  readFile(params: ResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const onStoragePath = this.buildOnStoragePath(params);

    return driver.readFile({ filePath: onStoragePath });
  }

  async writeFolderLegacy(sources: Sources, folderPath: string): Promise<void> {
    for (const key of Object.keys(sources)) {
      if (isObject(sources[key])) {
        await this.writeFolderLegacy(sources[key], join(folderPath, key));
        continue;
      }
      await this.writeFileLegacy({
        file: sources[key],
        name: key,
        folder: folderPath,
        mimeType: undefined,
      });
    }
  }

  async readFolderLegacy(
    folderPath: string,
    localTempPath?: string,
  ): Promise<Sources> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const tempDir = localTempPath || `/tmp/twenty-read-folder-${Date.now()}`;

    await mkdir(tempDir, { recursive: true });

    await driver.downloadFolder({
      onStoragePath: folderPath,
      localPath: tempDir,
    });

    return this.readLocalFolderToSources(tempDir);
  }

  private async readLocalFolderToSources(localPath: string): Promise<Sources> {
    const sources: Sources = {};
    const entries = await readdir(localPath);

    for (const entry of entries) {
      const entryPath = join(localPath, entry);
      const stats = await stat(entryPath);

      if (stats.isFile()) {
        sources[entry] = await readFile(entryPath, 'utf8');
      } else {
        sources[entry] = await this.readLocalFolderToSources(entryPath);
      }
    }

    return sources;
  }

  async readFolder(params: ResourceIdentifier): Promise<Sources> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);
    const tempDir = `/tmp/twenty-read-folder-${Date.now()}`;

    await mkdir(tempDir, { recursive: true });

    await driver.downloadFolder({
      onStoragePath,
      localPath: tempDir,
    });

    return this.readLocalFolderToSources(tempDir);
  }

  uploadFolder(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.uploadFolder({
      localPath: params.localPath,
      onStoragePath,
    });
  }

  downloadFolder(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.downloadFolder({
      onStoragePath,
      localPath: params.localPath,
    });
  }

  downloadFile(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.downloadFile({
      onStoragePath,
      localPath: params.localPath,
    });
  }

  deleteLegacy(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.delete(params);
  }

  async deleteApplicationFiles({
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }) {
    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId: workspaceId,
      },
    });

    await this.fileRepository.delete({
      applicationId: application.id,
      workspaceId,
    });
  }

  async delete(params: ResourceIdentifier): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    const deleteResult = driver.delete({ folderPath: onStoragePath });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: params.applicationUniversalIdentifier,
        workspaceId: params.workspaceId,
      },
    });

    const basePath = `${join(params.fileFolder, params.resourcePath)}`.replace(
      /\/+/g,
      '/',
    );

    await this.fileRepository.delete({
      path: Like(`${basePath}%`),
      applicationId: application.id,
      workspaceId: params.workspaceId,
    });

    return deleteResult;
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
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        path: Like(`${fileFolder}/%`),
      },
    });
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${file.workspaceId}/${file.applicationId}`,
      filename: file.path,
    });

    await this.fileRepository.delete(fileId);
  }

  copyLegacy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
  }

  copy({
    from,
    to,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy({
      from: { folderPath: this.buildOnStoragePath(from) },
      to: { folderPath: this.buildOnStoragePath(to) },
    });
  }

  async moveFile({
    from,
    to,
    workspaceId,
  }: {
    from: {
      applicationId: string;
      fileFolder: FileFolder;
      destinationPath: string;
    };
    to: {
      applicationId: string;
      fileFolder: FileFolder;
      destinationPath: string;
    };
    workspaceId: string;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        workspaceId,
        applicationId: from.applicationId,
        path: `${from.fileFolder}/${from.destinationPath}`,
      },
    });

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.move({
      from: {
        folderPath: `${file.workspaceId}/${from.applicationId}/${from.fileFolder}`,
        filename: from.destinationPath,
      },
      to: {
        folderPath: `${file.workspaceId}/${to.applicationId}/${to.fileFolder}`,
        filename: to.destinationPath,
      },
    });

    await this.fileRepository.update(file.id, {
      applicationId: to.applicationId,
      path: `${to.fileFolder}/${to.destinationPath}`,
    });
  }

  move({
    from,
    to,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.move({
      from: { folderPath: this.buildOnStoragePath(from) },
      to: { folderPath: this.buildOnStoragePath(to) },
    });
  }

  checkFolderExistsLegacy(params: { folderPath: string }): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFolderExists(params);
  }

  checkFileExists(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.checkFileExists({ filePath: onStoragePath });
  }

  checkFolderExists(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.checkFolderExists({ folderPath: onStoragePath });
  }
}
