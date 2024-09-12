import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  ServerlessDriverType,
  ServerlessModuleOptions,
} from 'src/engine/core-modules/serverless/serverless.interface';

export const serverlessModuleFactory = async (
  environmentService: EnvironmentService,
  fileStorageService: FileStorageService,
): Promise<ServerlessModuleOptions> => {
  const driverType = environmentService.get('SERVERLESS_TYPE');
  const options = { fileStorageService };

  switch (driverType) {
    case ServerlessDriverType.Local: {
      return {
        type: ServerlessDriverType.Local,
        options,
      };
    }
    case ServerlessDriverType.Lambda: {
      const region = environmentService.get('SERVERLESS_LAMBDA_REGION');
      const accessKeyId = environmentService.get(
        'SERVERLESS_LAMBDA_ACCESS_KEY_ID',
      );
      const secretAccessKey = environmentService.get(
        'SERVERLESS_LAMBDA_SECRET_ACCESS_KEY',
      );
      const role = environmentService.get('SERVERLESS_LAMBDA_ROLE');

      return {
        type: ServerlessDriverType.Lambda,
        options: {
          ...options,
          credentials: accessKeyId
            ? {
                accessKeyId,
                secretAccessKey,
              }
            : fromNodeProviderChain({
                clientConfig: { region },
              }),
          region: region ?? '',
          role: role ?? '',
        },
      };
    }
    default:
      throw new Error(
        `Invalid serverless driver type (${driverType}), check your .env file`,
      );
  }
};
