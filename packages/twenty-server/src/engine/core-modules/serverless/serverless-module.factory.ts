import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  ServerlessDriverType,
  type ServerlessModuleOptions,
} from 'src/engine/core-modules/serverless/serverless.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const serverlessModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  fileStorageService: FileStorageService,
): Promise<ServerlessModuleOptions> => {
  const driverType = twentyConfigService.get('SERVERLESS_TYPE');
  const options = { fileStorageService };

  switch (driverType) {
    case ServerlessDriverType.LOCAL: {
      return {
        type: ServerlessDriverType.LOCAL,
        options,
      };
    }
    case ServerlessDriverType.LAMBDA: {
      const region = twentyConfigService.get('SERVERLESS_LAMBDA_REGION');
      const accessKeyId = twentyConfigService.get(
        'SERVERLESS_LAMBDA_ACCESS_KEY_ID',
      );
      const secretAccessKey = twentyConfigService.get(
        'SERVERLESS_LAMBDA_SECRET_ACCESS_KEY',
      );
      const lambdaRole = twentyConfigService.get('SERVERLESS_LAMBDA_ROLE');

      const subhostingRole = twentyConfigService.get(
        'SERVERLESS_LAMBDA_SUBHOSTING_ROLE',
      );

      return {
        type: ServerlessDriverType.LAMBDA,
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
          region,
          lambdaRole,
          subhostingRole,
        },
      };
    }
    default:
      throw new Error(
        `Invalid serverless driver type (${driverType}), check your .env file`,
      );
  }
};
