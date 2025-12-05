import { Logger } from '@nestjs/common';

import fs from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
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
import { isObject } from '@sniptt/guards';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import type { Sources } from 'twenty-shared/types';

import { readFileContent } from 'src/engine/core-modules/file-storage/utils/read-file-content';
import { readS3FolderContent } from 'src/engine/core-modules/file-storage/utils/read-s3-folder-content';

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

  async write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Key: `${params.folder}/${params.name}`,
      Body: params.file,
      ContentType: params.mimeType,
      Bucket: this.bucketName,
    });

    await this.s3Client.send(command);
  }

  async writeFolder(sources: Sources, folderPath: string) {
    for (const key of Object.keys(sources)) {
      if (isObject(sources[key])) {
        await this.writeFolder(sources[key], join(folderPath, key));
        continue;
      }
      await this.write({
        file: sources[key],
        name: key,
        mimeType: undefined,
        folder: folderPath,
      });
    }
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

  // @ts-expect-error legacy noImplicitAny
  private async emptyS3Directory(folderPath) {
    this.logger.log(`${folderPath} - emptying folder`);

    const listedObjects = await this.fetchS3FolderContents(folderPath);

    this.logger.log(
      `${folderPath} - listed objects`,
      listedObjects.Contents,
      listedObjects.IsTruncated,
      listedObjects.Contents?.length,
    );

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

    this.logger.log(`${folderPath} - objects deleted`);

    if (listedObjects.IsTruncated) {
      this.logger.log(`${folderPath} - folder is truncated`);

      await this.emptyS3Directory(folderPath);
    }
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    this.logger.log(
      `${params.folderPath} - deleting file ${params.filename} from folder ${params.folderPath}`,
    );

    if (params.filename) {
      const deleteCommand = new DeleteObjectCommand({
        Key: `${params.folderPath}/${params.filename}`,
        Bucket: this.bucketName,
      });

      await this.s3Client.send(deleteCommand);
    } else {
      await this.emptyS3Directory(params.folderPath);

      this.logger.log(`${params.folderPath} - folder is empty`);

      const deleteEmptyFolderCommand = new DeleteObjectCommand({
        Key: `${params.folderPath}`,
        Bucket: this.bucketName,
      });

      await this.s3Client.send(deleteEmptyFolderCommand);
    }
  }

  async read(params: {
    folderPath: string;
    filename: string;
  }): Promise<Readable> {
    const command = new GetObjectCommand({
      Key: `${params.folderPath}/${params.filename}`,
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

  async readFolder(folderPath: string): Promise<Sources> {
    const sources: Sources = {};
    const listedObjects = await this.fetchS3FolderContents(folderPath);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return sources;
    }

    const files = (
      await Promise.all(
        listedObjects.Contents.map(async (object) => {
          if (!object.Key) {
            return;
          }

          const folderAndFilePaths = this.extractFolderAndFilePaths(object.Key);

          if (!isDefined(folderAndFilePaths)) {
            return;
          }

          const { fromFolderPath, filename } = folderAndFilePaths;

          const fileContent = await readFileContent(
            await this.read({ folderPath: fromFolderPath, filename }),
          );

          const formattedObjectKey = object.Key.replace(
            folderPath + '/',
            '',
          ).replace(folderPath, '');

          return { path: formattedObjectKey, fileContent };
        }),
      )
    ).filter(isDefined);

    return readS3FolderContent(files);
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
      // Check if the source file exists
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: fromKey,
        }),
      );

      // Copy the object to the new location
      await this.s3Client.send(
        new CopyObjectCommand({
          CopySource: `${this.bucketName}/${fromKey}`,
          Bucket: this.bucketName,
          Key: toKey,
        }),
      );

      // Delete the original object
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
      // For other errors, throw the original error
      throw error;
    }
  }

  async moveS3Folder(params: {
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

  extractFolderAndFilePaths(objectKey: string | undefined) {
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
        // Check if the source file exists
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: fromKey,
          }),
        );

        // Copy the object to the new location
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
        // For other errors, throw the original error
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
        from: {
          folderPath: fromFolderPath,
          filename,
        },
        to: { folderPath: toFolderPath, filename },
      });
    }
  }

  async download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (!params.from.filename && params.to.filename) {
      throw new Error('Cannot copy folder to file');
    }

    if (isDefined(params.from.filename)) {
      try {
        const dir = params.to.folderPath;

        await mkdir(dir, { recursive: true });

        const fileStream = await this.read({
          folderPath: params.from.folderPath,
          filename: params.from.filename,
        });

        const toPath = join(
          params.to.folderPath,
          params.to.filename || params.from.filename,
        );

        await pipeline(fileStream, fs.createWriteStream(toPath));

        return;
      } catch (error) {
        if (error.name === 'NotFound') {
          throw new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          );
        }
        // For other errors, throw the original error
        throw error;
      }
    }

    const listedObjects = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: params.from.folderPath,
      }),
    );

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

      await this.download({
        from: {
          folderPath: fromFolderPath,
          filename,
        },
        to: { folderPath: toFolderPath, filename },
      });
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

  async checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: `${params.folderPath}/${params.filename}`,
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

  async checkFolderExists(folderPath: string): Promise<boolean> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPath,
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
}
