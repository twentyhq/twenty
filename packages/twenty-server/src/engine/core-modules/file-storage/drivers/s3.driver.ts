import { Logger } from '@nestjs/common';

import fs from 'fs';
import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import {
  CopyObjectCommand,
  type CreateBucketCommandInput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  type HeadBucketCommandInput,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  PutObjectCommand,
  S3,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { isDefined } from 'twenty-shared/utils';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

export interface S3DriverOptions extends S3ClientConfig {
  bucketName: string;
  endpoint?: string;
  region: string;
}

export class S3Driver implements StorageDriver {
  private s3Client: S3;
  private bucketName: string;
  private readonly logger = new Logger(S3Driver.name);

  constructor(options: S3DriverOptions) {
    const { bucketName, region, endpoint, ...s3Options } = options;

    if (!bucketName || !region) {
      return;
    }

    this.s3Client = new S3({ ...s3Options, region, endpoint });
    this.bucketName = bucketName;
  }

  public get client(): S3 {
    return this.s3Client;
  }

  async readFile(params: { filePath: string }): Promise<Readable> {
    const command = new GetObjectCommand({
      Key: params.filePath,
      Bucket: this.bucketName,
    });

    try {
      const file = await this.s3Client.send(command);

      if (!file || !file.Body || !(file.Body instanceof Readable)) {
        throw new Error('Unable to get file stream');
      }

      return Readable.from(file.Body);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async writeFile(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Key: params.filePath,
      Body: params.sourceFile,
      ContentType: params.mimeType,
      Bucket: this.bucketName,
    });

    await this.s3Client.send(command);
  }

  private async createFolder(path: string) {
    return fs.mkdirSync(path, { recursive: true });
  }

  async downloadFile(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    await this.createFolder(dirname(params.localPath));

    const fileStream = await this.readFile({
      filePath: params.onStoragePath,
    });

    await pipeline(fileStream, fs.createWriteStream(params.localPath));
  }

  async downloadFolder(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    const listedObjects = await this.fetchS3FolderContents(
      params.onStoragePath,
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return;
    }

    for (const object of listedObjects.Contents) {
      const folderAndFilePaths = this.extractFolderAndFilePaths(object.Key);

      if (!isDefined(folderAndFilePaths)) {
        continue;
      }

      const { fromFolderPath, filename } = folderAndFilePaths;

      const relativePath = fromFolderPath
        .replace(params.onStoragePath + '/', '')
        .replace(params.onStoragePath, '');

      const localFolderPath = relativePath
        ? join(params.localPath, relativePath)
        : params.localPath;

      await this.createFolder(localFolderPath);

      const fileStream = await this.readFile({
        filePath: `${fromFolderPath}/${filename}`,
      });

      const toPath = join(localFolderPath, filename);

      await pipeline(fileStream, fs.createWriteStream(toPath));
    }
  }

  async uploadFolder(params: {
    localPath: string;
    onStoragePath: string;
  }): Promise<void> {
    const entries = await readdir(params.localPath, { withFileTypes: true });

    for (const entry of entries) {
      const localEntryPath = join(params.localPath, entry.name);

      if (entry.isDirectory()) {
        await this.uploadFolder({
          localPath: localEntryPath,
          onStoragePath: join(params.onStoragePath, entry.name),
        });
      } else {
        const fileContent = await readFile(localEntryPath);

        await this.writeFile({
          filePath: `${params.onStoragePath}/${entry.name}`,
          sourceFile: fileContent,
          mimeType: undefined,
        });
      }
    }
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    if (params.filename) {
      const deleteCommand = new DeleteObjectCommand({
        Key: `${params.folderPath}/${params.filename}`,
        Bucket: this.bucketName,
      });

      await this.s3Client.send(deleteCommand);
    } else {
      await this.emptyS3Directory(params.folderPath);

      const deleteEmptyFolderCommand = new DeleteObjectCommand({
        Key: `${params.folderPath}`,
        Bucket: this.bucketName,
      });

      await this.s3Client.send(deleteEmptyFolderCommand);
    }
  }

  async move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (!params.from.filename || !params.to.filename) {
      await this.moveS3Folder(params);

      return;
    }

    const fromKey = `${params.from.folderPath}/${params.from.filename}`;
    const toKey = `${params.to.folderPath}/${params.to.filename}`;

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: fromKey,
        }),
      );

      await this.s3Client.send(
        new CopyObjectCommand({
          CopySource: `${this.bucketName}/${fromKey}`,
          Bucket: this.bucketName,
          Key: toKey,
        }),
      );

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fromKey,
        }),
      );
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        );
      }
      throw error;
    }
  }

  async copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (!params.from.filename && params.to.filename) {
      throw new Error('Cannot copy folder to file');
    }

    const fromKey = `${params.from.folderPath}/${params.from.filename || ''}`;
    const toKey = `${params.to.folderPath}/${params.to.filename || ''}`;

    if (isDefined(params.from.filename)) {
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: fromKey,
          }),
        );

        await this.s3Client.send(
          new CopyObjectCommand({
            CopySource: `${this.bucketName}/${fromKey}`,
            Bucket: this.bucketName,
            Key: toKey,
          }),
        );

        return;
      } catch (error) {
        if (error.name === 'NotFound') {
          throw new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          );
        }
        throw error;
      }
    }

    const listedObjects = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: fromKey,
      }),
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      throw new Error(`No objects found in the source folder ${fromKey}.`);
    }

    for (const object of listedObjects.Contents) {
      const folderAndFilePaths = this.extractFolderAndFilePaths(object.Key);

      if (!isDefined(folderAndFilePaths)) {
        continue;
      }

      const { fromFolderPath, filename } = folderAndFilePaths;

      const toFolderPath = fromFolderPath.replace(
        params.from.folderPath,
        params.to.folderPath,
      );

      if (!isDefined(toFolderPath)) {
        continue;
      }

      await this.copy({
        from: { folderPath: fromFolderPath, filename },
        to: { folderPath: toFolderPath, filename },
      });
    }
  }

  async checkFileExists(params: { filePath: string }): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: params.filePath,
        }),
      );
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }

      throw error;
    }

    return true;
  }

  async checkFolderExists(params: { folderPath: string }): Promise<boolean> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: params.folderPath,
        MaxKeys: 1,
      });

      const result = await this.s3Client.send(listCommand);

      return (result.Contents && result.Contents.length > 0) || false;
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }

      throw error;
    }
  }

  async checkBucketExists(args: HeadBucketCommandInput) {
    try {
      await this.s3Client.headBucket(args);

      return true;
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }

      throw error;
    }
  }

  async createBucket(args: CreateBucketCommandInput) {
    const exist = await this.checkBucketExists({
      Bucket: args.Bucket,
    });

    if (exist) {
      return;
    }

    return this.s3Client.createBucket(args);
  }

  private async fetchS3FolderContents(folderPath: string) {
    const listParams = {
      Bucket: this.bucketName,
      Prefix: folderPath,
    };

    const listObjectsCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await this.s3Client.send(listObjectsCommand);

    return listedObjects;
  }

  private async emptyS3Directory(folderPath: string) {
    const listedObjects = await this.fetchS3FolderContents(folderPath);

    if (listedObjects.Contents?.length === 0) return;

    const deleteParams = {
      Bucket: this.bucketName,
      Delete: {
        Objects: listedObjects.Contents?.map(({ Key }) => {
          return { Key };
        }),
      },
    };

    const deleteObjectCommand = new DeleteObjectsCommand(deleteParams);

    await this.s3Client.send(deleteObjectCommand);

    if (listedObjects.IsTruncated) {
      await this.emptyS3Directory(folderPath);
    }
  }

  private extractFolderAndFilePaths(objectKey: string | undefined) {
    if (!isDefined(objectKey)) {
      return;
    }

    const result = /(?<folder>.*)\/(?<file>.*)/.exec(objectKey);

    if (!isDefined(result) || !isDefined(result.groups)) {
      return;
    }

    const fromFolderPath = result.groups.folder;
    const filename = result.groups.file;

    return { fromFolderPath, filename };
  }

  private async moveS3Folder(params: {
    from: { folderPath: string };
    to: { folderPath: string };
  }): Promise<void> {
    const fromKey = `${params.from.folderPath}`;

    const listedObjects = await this.fetchS3FolderContents(fromKey);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      throw new Error(
        `No objects found in the source folder ${params.from.folderPath}.`,
      );
    }

    for (const object of listedObjects.Contents) {
      const folderAndFilePaths = this.extractFolderAndFilePaths(object.Key);

      if (!isDefined(folderAndFilePaths)) {
        continue;
      }

      const { fromFolderPath, filename } = folderAndFilePaths;

      const toFolderPath = fromFolderPath.replace(
        params.from.folderPath,
        params.to.folderPath,
      );

      if (!isDefined(toFolderPath)) {
        continue;
      }

      await this.move({
        from: { folderPath: fromFolderPath, filename },
        to: { folderPath: toFolderPath, filename },
      });
    }
  }
}
