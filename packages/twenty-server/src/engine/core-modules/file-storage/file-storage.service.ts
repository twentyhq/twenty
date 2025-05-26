import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';

import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';
import { DynamicDriverBase } from 'src/engine/core-modules/twenty-config/dynamic-driver.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

@Injectable()
export class FileStorageService
  extends DynamicDriverBase<StorageDriver>
  implements StorageDriver
{
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  protected buildConfigKey(): string {
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');

    if (storageType === StorageDriverType.Local) {
      const storagePath = this.twentyConfigService.get('STORAGE_LOCAL_PATH');

      return `local|${storagePath}`;
    }

    if (storageType === StorageDriverType.S3) {
      const storageConfigHash = this.getConfigGroupHash(
        ConfigVariablesGroup.StorageConfig,
      );

      return `s3|${storageConfigHash}`;
    }

    throw new Error(`Unsupported storage type: ${storageType}`);
  }

  protected createDriver(): StorageDriver {
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');

    switch (storageType) {
      case StorageDriverType.Local: {
        const storagePath = this.twentyConfigService.get('STORAGE_LOCAL_PATH');

        return new LocalDriver({
          storagePath: resolveAbsolutePath(storagePath),
        });
      }

      case StorageDriverType.S3: {
        const bucketName = this.twentyConfigService.get('STORAGE_S3_NAME');
        const endpoint = this.twentyConfigService.get('STORAGE_S3_ENDPOINT');
        const region = this.twentyConfigService.get('STORAGE_S3_REGION');
        const accessKeyId = this.twentyConfigService.get(
          'STORAGE_S3_ACCESS_KEY_ID',
        );
        const secretAccessKey = this.twentyConfigService.get(
          'STORAGE_S3_SECRET_ACCESS_KEY',
        );

        return new S3Driver({
          bucketName: bucketName ?? '',
          endpoint: endpoint,
          credentials: accessKeyId
            ? { accessKeyId, secretAccessKey }
            : fromNodeProviderChain({ clientConfig: { region } }),
          forcePathStyle: true,
          region: region ?? '',
        });
      }

      default:
        throw new Error(`Invalid storage driver type: ${storageType}`);
    }
  }

  write(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    return this.getCurrentDriver().write(params);
  }

  read(params: { folderPath: string; filename: string }): Promise<Readable> {
    return this.getCurrentDriver().read(params);
  }

  delete(params: { folderPath: string; filename?: string }): Promise<void> {
    return this.getCurrentDriver().delete(params);
  }

  move(params: {
    from: { folderPath: string; filename: string };
    to: { folderPath: string; filename: string };
  }): Promise<void> {
    return this.getCurrentDriver().move(params);
  }

  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    return this.getCurrentDriver().copy(params);
  }

  download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    return this.getCurrentDriver().download(params);
  }

  checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    return this.getCurrentDriver().checkFileExists(params);
  }
}
