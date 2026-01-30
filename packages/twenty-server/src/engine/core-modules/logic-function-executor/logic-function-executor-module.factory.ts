import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  LogicFunctionExecutorDriverType,
  type LogicFunctionExecutorModuleOptions,
} from 'src/engine/core-modules/logic-function-executor/logic-function-executor.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const logicFunctionExecutorModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  fileStorageService: FileStorageService,
): Promise<LogicFunctionExecutorModuleOptions> => {
  const driverType = twentyConfigService.get('LOGIC_FUNCTION_TYPE');
  const options = { fileStorageService };

  switch (driverType) {
    case LogicFunctionExecutorDriverType.DISABLED: {
      return {
        type: LogicFunctionExecutorDriverType.DISABLED,
      };
    }
    case LogicFunctionExecutorDriverType.LOCAL: {
      return {
        type: LogicFunctionExecutorDriverType.LOCAL,
        options,
      };
    }
    case LogicFunctionExecutorDriverType.LAMBDA: {
      const region = twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_REGION');
      const accessKeyId = twentyConfigService.get(
        'LOGIC_FUNCTION_LAMBDA_ACCESS_KEY_ID',
      );
      const secretAccessKey = twentyConfigService.get(
        'LOGIC_FUNCTION_LAMBDA_SECRET_ACCESS_KEY',
      );
      const lambdaRole = twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_ROLE');

      const subhostingRole = twentyConfigService.get(
        'LOGIC_FUNCTION_LAMBDA_SUBHOSTING_ROLE',
      );

      return {
        type: LogicFunctionExecutorDriverType.LAMBDA,
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
        `Invalid logic function executor driver type (${driverType}), check your .env file`,
      );
  }
};
