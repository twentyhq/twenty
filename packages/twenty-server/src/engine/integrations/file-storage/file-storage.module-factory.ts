import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  FileStorageModuleOptions,
  StorageDriverType,
} from 'src/engine/integrations/file-storage/interfaces';

/**
 * FileStorage Module factory
 * @param environment
 * @returns FileStorageModuleOptions
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
          storagePath: process.cwd() + '/' + storagePath,
        },
      };
    }
    case StorageDriverType.S3: {
      const bucketName = environmentService.get('STORAGE_S3_NAME');
      const endpoint = environmentService.get('STORAGE_S3_ENDPOINT');
      const region = environmentService.get('STORAGE_S3_REGION');

      return {
        type: StorageDriverType.S3,
        options: {
          bucketName: bucketName ?? '',
          endpoint: endpoint,
          credentials: fromNodeProviderChain({
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
