import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable } from 'stream';

import { FileFolder, Sources } from 'twenty-shared/types';
import { Repository } from 'typeorm';

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
    applicationId,
    workspaceId,
    fileId,
  }: {
    sourceFile: string | Buffer | Uint8Array;
    destinationPath: string;
    mimeType: string | undefined;
    fileFolder: FileFolder;
    applicationId: string;
    workspaceId: string;
    fileId?: string;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const driverParams = {
      filePath: `${workspaceId}/${applicationId}/${fileFolder}/${destinationPath}`,
      mimeType,
      sourceFile,
    };

    await driver.write(driverParams);

    const fileEntity = await this.fileRepository.save({
      path: `${fileFolder}/${destinationPath}`,
      workspaceId,
      applicationId,
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
    applicationId,
    workspaceId,
  }: {
    destinationPath: string;
    fileFolder: FileFolder;
    applicationId: string;
    workspaceId: string;
  }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const folderPath = `${workspaceId}/${applicationId}/${fileFolder}/${destinationPath}`;

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
