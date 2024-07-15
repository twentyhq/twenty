import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import {
  CustomCodeEngineModuleOptions,
  CustomCodeEngineDriverType,
} from 'src/engine/core-modules/custom-code-engine/interfaces/custom-code-engine.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

export const customCodeEngineModuleFactory = async (
  environmentService: EnvironmentService,
  fileStorageService: FileStorageService,
  fileUploadService: FileUploadService,
): Promise<CustomCodeEngineModuleOptions> => {
  const driverType = environmentService.get('CODE_EXECUTOR_TYPE');

  switch (driverType) {
    case CustomCodeEngineDriverType.Local: {
      return {
        type: CustomCodeEngineDriverType.Local,
        options: { fileStorageService, fileUploadService },
      };
    }
    case CustomCodeEngineDriverType.Lambda: {
      const region = environmentService.get('CODE_EXECUTOR_LAMBDA_REGION');
      const accessKeyId = environmentService.get(
        'CODE_EXECUTOR_LAMBDA_ACCESS_KEY_ID',
      );
      const secretAccessKey = environmentService.get(
        'CODE_EXECUTOR_LAMBDA_SECRET_ACCESS_KEY',
      );
      const role = environmentService.get('CODE_EXECUTOR_LAMBDA_ROLE');

      return {
        type: CustomCodeEngineDriverType.Lambda,
        options: {
          fileUploadService,
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
        `Invalid custom code engine driver type (${driverType}), check your .env file`,
      );
  }
};
