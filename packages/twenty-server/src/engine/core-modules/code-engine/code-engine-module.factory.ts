import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import {
  CodeEngineModuleOptions,
  CodeEngineDriverType,
} from 'src/engine/core-modules/code-engine/interfaces/code-engine.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

export const codeEngineModuleFactory = async (
  environmentService: EnvironmentService,
  fileStorageService: FileStorageService,
  fileUploadService: FileUploadService,
): Promise<CodeEngineModuleOptions> => {
  const driverType = environmentService.get('CODE_EXECUTOR_TYPE');

  switch (driverType) {
    case CodeEngineDriverType.Local: {
      return {
        type: CodeEngineDriverType.Local,
        options: { fileStorageService, fileUploadService },
      };
    }
    case CodeEngineDriverType.Lambda: {
      const region = environmentService.get('CODE_EXECUTOR_LAMBDA_REGION');
      const accessKeyId = environmentService.get(
        'CODE_EXECUTOR_LAMBDA_ACCESS_KEY_ID',
      );
      const secretAccessKey = environmentService.get(
        'CODE_EXECUTOR_LAMBDA_SECRET_ACCESS_KEY',
      );
      const role = environmentService.get('CODE_EXECUTOR_LAMBDA_ROLE');

      return {
        type: CodeEngineDriverType.Lambda,
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
