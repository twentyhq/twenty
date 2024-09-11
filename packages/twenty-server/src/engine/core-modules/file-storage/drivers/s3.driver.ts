import { Readable } from 'stream';

import {
  CopyObjectCommand,
  CreateBucketCommandInput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommandInput,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  PutObjectCommand,
  S3,
  S3ClientConfig,
} from '@aws-sdk/client-s3';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';

import { isDefined } from 'src/utils/is-defined';

export interface S3DriverOptions extends S3ClientConfig {
  bucketName: string;
  endpoint?: string;
  region: string;
}

export class S3Driver implements StorageDriver {
  private s3Client: S3;
  private bucketName: string;

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

  private async emptyS3Directory(folderPath) {
    const listParams = {
      Bucket: this.bucketName,
      Prefix: folderPath,
    };

    const listObjectsCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await this.s3Client.send(listObjectsCommand);

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

  async move(params: {
    from: { folderPath: string; filename: string };
    to: { folderPath: string; filename: string };
  }): Promise<void> {
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
      throw new Error('No objects found in the source folder.');
    }

    for (const object of listedObjects.Contents) {
      const match = object.Key?.match(/(.*)\/(.*)/);

      if (!isDefined(match)) {
        continue;
      }
      const fromFolderPath = match[1];
      const filename = match[2];
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
}
