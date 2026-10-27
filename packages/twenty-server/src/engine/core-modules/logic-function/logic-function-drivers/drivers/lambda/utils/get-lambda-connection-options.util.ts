import { isNonEmptyString } from '@sniptt/guards';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { getLambdaResourceNamespace } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-resource-namespace.util';

export const getLambdaConnectionOptions = (
  twentyConfigService: TwentyConfigService,
): LambdaConnectionOptions => {
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
  const resourceTags =
    twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_RESOURCE_TAGS') ?? {};
  const resourceNamespace = getLambdaResourceNamespace({
    lambdaRoleArn: lambdaRole,
  });

  return {
    credentials: isNonEmptyString(accessKeyId)
      ? { accessKeyId, secretAccessKey }
      : fromNodeProviderChain({ clientConfig: { region } }),
    region,
    endpoint: twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_ENDPOINT'),
    lambdaRole,
    subhostingRole,
    layerBucket,
    layerBucketRegion,
    resourceNamespace,
    resourceTags:
      Object.keys(resourceTags).length > 0 ? resourceTags : undefined,
  };
};
