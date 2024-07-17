import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import {
  ServerlessModuleOptions,
  ServerlessDriverType,
} from 'src/engine/integrations/serverless/serverless.interface';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

export const serverlessModuleFactory = async (
  environmentService: EnvironmentService,
  fileStorageService: FileStorageService,
  fileUploadService: FileUploadService,
): Promise<ServerlessModuleOptions> => {
  const driverType = environmentService.get('SERVERLESS_TYPE');

  switch (driverType) {
    case ServerlessDriverType.Local: {
      return {
        type: ServerlessDriverType.Local,
        options: { fileStorageService, fileUploadService },
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
          fileStorageService,
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
