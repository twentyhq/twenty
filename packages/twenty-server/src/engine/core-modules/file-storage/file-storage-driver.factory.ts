import { Injectable } from '@nestjs/common';

import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';

import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

@Injectable()
export class FileStorageDriverFactory extends DriverFactoryBase<StorageDriver> {
  constructor(twentyConfigService: TwentyConfigService) {
    super(twentyConfigService);
  }

  protected buildConfigKey(): string {
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');

    if (storageType === StorageDriverType.LOCAL) {
      const storagePath = this.twentyConfigService.get('STORAGE_LOCAL_PATH');

      return `local|${storagePath}`;
    }

    if (storageType === StorageDriverType.S_3) {
      const storageConfigHash = this.getConfigGroupHash(
        ConfigVariablesGroup.STORAGE_CONFIG,
      );

      return `s3|${storageConfigHash}`;
    }

    throw new Error(`Unsupported storage type: ${storageType}`);
  }

  protected createDriver(): StorageDriver {
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');

    switch (storageType) {
      case StorageDriverType.LOCAL: {
        const storagePath = this.twentyConfigService.get('STORAGE_LOCAL_PATH');

        return new LocalDriver({
          storagePath: resolveAbsolutePath(storagePath),
        });
      }

      case StorageDriverType.S_3: {
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
}
