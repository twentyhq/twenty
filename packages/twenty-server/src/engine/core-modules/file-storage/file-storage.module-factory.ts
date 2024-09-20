import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import {
  FileStorageModuleOptions,
  StorageDriverType,
} from 'src/engine/core-modules/file-storage/interfaces';
import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

/**
 * FileStorage Module factory
 * @returns FileStorageModuleOptions
 * @param environmentService
 */
export const fileStorageModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<FileStorageModuleOptions> => {
  const driverType = environmentService.get('STORAGE_TYPE');

  switch (driverType) {
    case StorageDriverType.Local: {
      const storagePath = environmentService.get('STORAGE_LOCAL_PATH');

      return {
        type: StorageDriverType.Local,
        options: {
          storagePath: resolveAbsolutePath(storagePath),
        },
      };
    }
    case StorageDriverType.S3: {
      const bucketName = environmentService.get('STORAGE_S3_NAME');
      const endpoint = environmentService.get('STORAGE_S3_ENDPOINT');
      const region = environmentService.get('STORAGE_S3_REGION');
      const accessKeyId = environmentService.get('STORAGE_S3_ACCESS_KEY_ID');
      const secretAccessKey = environmentService.get(
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
