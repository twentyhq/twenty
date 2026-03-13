import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import {
  LogicFunctionDriverType,
  type LogicFunctionModuleOptions,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import type { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import type { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client-generation/sdk-client-generation.service';

export const logicFunctionModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  logicFunctionResourceService: LogicFunctionResourceService,
  sdkClientGenerationService: SdkClientGenerationService,
): Promise<LogicFunctionModuleOptions> => {
  const driverType = twentyConfigService.get('LOGIC_FUNCTION_TYPE');

  const options = { logicFunctionResourceService, sdkClientGenerationService };

  switch (driverType) {
    case LogicFunctionDriverType.DISABLED: {
      return {
        type: LogicFunctionDriverType.DISABLED,
      };
    }
    case LogicFunctionDriverType.LOCAL: {
      return {
        type: LogicFunctionDriverType.LOCAL,
        options,
      };
    }
    case LogicFunctionDriverType.LAMBDA: {
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

      const s3BucketName = twentyConfigService.get('STORAGE_S3_NAME');

      const layerBucket =
        twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET') ??
        s3BucketName ??
        'twenty-lambda-layer';

      const layerBucketRegion =
        twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET_REGION') ??
        region;

      return {
        type: LogicFunctionDriverType.LAMBDA,
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
          layerBucket,
          layerBucketRegion,
        },
      };
    }
    default:
      throw new Error(
        `Invalid logic function executor driver type (${driverType}), check your .env file`,
      );
  }
};
