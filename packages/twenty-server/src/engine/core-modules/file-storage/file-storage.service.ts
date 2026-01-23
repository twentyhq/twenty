import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable } from 'stream';

import { FileFolder, Sources } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

@Injectable()
//TODO: Implement storage driver interface when removing v1
//export class FileStorageService implements StorageDriver {
export class FileStorageService {
  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  /**
   * @deprecated Use write_v2 instead
   */
  write(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    const { file, name, folder, mimeType } = params;

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.write({
      filePath: `${folder}/${name}`,
      sourceFile: file,
      mimeType,
    });
  }

  async write_v2({
    sourceFile,
    destinationPath,
    mimeType,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    fileId,
  }: {
    sourceFile: string | Buffer | Uint8Array;
    destinationPath: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
    workspaceId: string;
    fileId?: string;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    });

    const driverParams = {
      filePath: `${workspaceId}/${applicationUniversalIdentifier}/${fileFolder}/${destinationPath}`,
      mimeType,
      sourceFile,
    };

    await driver.write(driverParams);

    const fileEntity = await this.fileRepository.save({
      path: `${fileFolder}/${destinationPath}`,
      workspaceId,
      applicationId: application.id,
      id: fileId,
      size:
        typeof sourceFile === 'string'
          ? Buffer.byteLength(sourceFile)
          : sourceFile.length,
    });

    return fileEntity;
  }

  /**
   * @deprecated Use read_v2 instead
   */
  read(params: { folderPath: string; filename: string }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { folderPath, filename } = params;

    return driver.read({ filePath: `${folderPath}/${filename}` });
  }

  read_v2({
    destinationPath,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    destinationPath: string;
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const folderPath = `${workspaceId}/${applicationUniversalIdentifier}/${fileFolder}/${destinationPath}`;

    return driver.read({ filePath: folderPath });
  }

  writeFolder(sources: Sources, folderPath: string): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.writeFolder(sources, folderPath);
  }

  readFolder(folderPath: string): Promise<Sources> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.readFolder(folderPath);
  }

  delete(params: { folderPath: string; filename?: string }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.delete(params);
  }

  async deleteByFileId({
    fileId,
    workspaceId,
    applicationId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    applicationId: string;
    fileFolder: FileFolder;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        applicationId,
        path: Like(`${fileFolder}%`),
      },
    });
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${file.workspaceId}/${file.applicationId}`,
      filename: file.path,
    });

    await this.fileRepository.delete(fileId);
  }

  move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.move(params);
  }

  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
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

  download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.download(params);
  }

  checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFileExists(params);
  }

  checkFolderExists(folderPath: string): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFolderExists(folderPath);
  }
}
