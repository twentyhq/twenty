import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { mkdir, readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { type Readable } from 'stream';

import { isObject } from '@sniptt/guards';
import { FileFolder, Sources } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';

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
    return `${workspaceId}/${applicationUniversalIdentifier}/${fileFolder}/${resourcePath}`;
  }

  /**
   * @deprecated Use writeFile_v2 instead
   */
  writeFile(params: {
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

  async writeFile_v2({
    sourceFile,
    mimeType,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    fileId,
    settings,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
    mimeType: string | undefined;
    fileId?: string;
    settings: FileSettings;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const application = await this.applicationRepository.findOneOrFail({
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

    await this.fileRepository.upsert(
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

    return await this.fileRepository.findOneOrFail({
      where: {
        path: `${fileFolder}/${resourcePath}`,
        applicationId: application.id,
        workspaceId,
      },
    });
  }

  /**
   * @deprecated Use readFile_v2 instead
   */
  readFile(params: { filePath: string }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.readFile(params);
  }

  readFile_v2(params: ResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const onStoragePath = this.buildOnStoragePath(params);

    return driver.readFile({ filePath: onStoragePath });
  }

  /**
   * @deprecated Use uploadFolder_v2 with local temp directory instead
   */
  async writeFolder(sources: Sources, folderPath: string): Promise<void> {
    for (const key of Object.keys(sources)) {
      if (isObject(sources[key])) {
        await this.writeFolder(sources[key], join(folderPath, key));
        continue;
      }
      await this.writeFile({
        file: sources[key],
        name: key,
        folder: folderPath,
        mimeType: undefined,
      });
    }
  }

  /**
   * @deprecated Use downloadFolder_v2 with local temp directory instead
   */
  async readFolder(
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

  async readFolder_v2(params: ResourceIdentifier): Promise<Sources> {
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

  uploadFolder_v2(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.uploadFolder({
      localPath: params.localPath,
      onStoragePath,
    });
  }

  downloadFolder_v2(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.downloadFolder({
      onStoragePath,
      localPath: params.localPath,
    });
  }

  downloadFile_v2(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.downloadFile({
      onStoragePath,
      localPath: params.localPath,
    });
  }

  /**
   * @deprecated Use delete_v2 instead
   */
  delete(params: { folderPath: string; filename?: string }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.delete(params);
  }

  delete_v2(params: ResourceIdentifier): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.delete({ folderPath: onStoragePath });
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

  /**
   * @deprecated Use copy_v2 instead
   */
  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
  }

  copy_v2({
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

  /**
   * @deprecated Use move_v2 instead
   */
  move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.move(params);
  }

  move_v2({
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

  /**
   * @deprecated Use checkFileExists_v2 instead
   */
  checkFileExists(params: { filePath: string }): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFileExists(params);
  }

  checkFileExists_v2(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.checkFileExists({ filePath: onStoragePath });
  }

  /**
   * @deprecated Use checkFolderExists_v2 instead
   */
  checkFolderExists(params: { folderPath: string }): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFolderExists(params);
  }

  checkFolderExists_v2(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.buildOnStoragePath(params);

    return driver.checkFolderExists({ folderPath: onStoragePath });
  }
}
