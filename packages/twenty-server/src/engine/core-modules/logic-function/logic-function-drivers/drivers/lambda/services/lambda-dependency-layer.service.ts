import {
  PublishLayerVersionCommand,
  InvalidParameterValueException,
} from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_TTL_MS,
  BUILD_LOCK_MAX_RETRIES,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type YarnInstallLambdaPayload } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type DependencyLayerInput = {
  layerName: string;
  readDependencies: () => Promise<
    Pick<YarnInstallLambdaPayload, 'packageJson' | 'yarnLock'>
  >;
};

export class LambdaDependencyLayerService {
  constructor(
    private readonly layerBucket: string,
    private readonly awsClient: LambdaAwsClientService,
    private readonly toolFunctions: LambdaToolFunctionsService,
    private readonly cacheLockService: CacheLockService,
  ) {}
  async ensureLayer({
    layerName,
    readDependencies,
  }: DependencyLayerInput): Promise<string> {
    const existingArn = await this.awsClient.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    return this.cacheLockService.withLock(
      async () => {
        const arnCreatedWhileWaiting =
          await this.awsClient.getExistingLayerArn(layerName);

        if (isDefined(arnCreatedWhileWaiting)) {
          return arnCreatedWhileWaiting;
        }

        await this.createLayer({ layerName, readDependencies });

        const newArn = await this.awsClient.getExistingLayerArn(layerName);

        if (!isDefined(newArn)) {
          throw new LogicFunctionException(
            `Layer '${layerName}' was not created by the yarn install Lambda`,
            LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
          );
        }

        return newArn;
      },
      `lambda-deps-layer:${layerName}`,
      {
        ttl: BUILD_LOCK_TTL_MS,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  private async createLayer({
    layerName,
    readDependencies,
  }: DependencyLayerInput): Promise<void> {
    const existingArn = await this.awsClient.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return;
    }

    const dependencies = await readDependencies();

    const s3Key = `lambda-layers/${layerName}.zip`;
    const presignedUploadUrl =
      await this.awsClient.generatePresignedUploadUrl(s3Key);

    await this.toolFunctions.runYarnInstallCreateLayer({
      ...dependencies,
      presignedUploadUrl,
    });

    const lambdaClient = await this.awsClient.getLambdaClient();

    try {
      const publishResult = await lambdaClient.send(
        new PublishLayerVersionCommand({
          LayerName: layerName,
          Content: {
            S3Bucket: this.layerBucket,
            S3Key: s3Key,
          },
          CompatibleRuntimes: [
            LogicFunctionRuntime.NODE18,
            LogicFunctionRuntime.NODE22,
          ],
        }),
      );

      if (!isDefined(publishResult.LayerVersionArn)) {
        throw new LogicFunctionException(
          `PublishLayerVersion did not return a LayerVersionArn for layer '${layerName}'`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
        );
      }
    } catch (error) {
      if (
        error instanceof InvalidParameterValueException &&
        error.message.toLowerCase().includes('size')
      ) {
        throw new LogicFunctionException(
          `Dependency layer '${layerName}' exceeds the Lambda layer size limit: ${error.message}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
        );
      }

      throw error;
    }
  }
}
