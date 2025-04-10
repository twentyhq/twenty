import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import {
  FileStorageModuleOptions,
  StorageDriverType,
} from 'src/engine/core-modules/file-storage/interfaces';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

/**
 * FileStorage Module factory
 * @returns FileStorageModuleOptions
 * @param twentyConfigService
 */
export const fileStorageModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<FileStorageModuleOptions> => {
  const driverType = twentyConfigService.get('STORAGE_TYPE');

  switch (driverType) {
    case StorageDriverType.Local: {
      const storagePath = twentyConfigService.get('STORAGE_LOCAL_PATH');

      return {
        type: StorageDriverType.Local,
        options: {
          storagePath: resolveAbsolutePath(storagePath),
        },
      };
    }
    case StorageDriverType.S3: {
      const bucketName = twentyConfigService.get('STORAGE_S3_NAME');
      const endpoint = twentyConfigService.get('STORAGE_S3_ENDPOINT');
      const region = twentyConfigService.get('STORAGE_S3_REGION');
      const accessKeyId = twentyConfigService.get('STORAGE_S3_ACCESS_KEY_ID');
      const secretAccessKey = twentyConfigService.get(
        'STORAGE_S3_SECRET_ACCESS_KEY',
      );

      return {
        type: StorageDriverType.S3,
        options: {
          bucketName: bucketName ?? '',
          endpoint: endpoint,
          credentials: accessKeyId
            ? {
                accessKeyId,
                secretAccessKey,
              }
            : fromNodeProviderChain({
                clientConfig: { region },
              }),
          forcePathStyle: true,
          region: region ?? '',
        },
      };
    }
    default:
      throw new Error(
        `Invalid storage driver type (${driverType}), check your .env file`,
      );
  }
};
