import * as fs from 'fs/promises';
import { join } from 'path';

import {
  CreateFunctionCommand,
  type CreateFunctionCommandInput,
  DeleteFunctionCommand,
  GetFunctionCommand,
  type GetFunctionCommandOutput,
  ResourceNotFoundException,
  TagResourceCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import { Logger } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  EXECUTOR_LAMBDA_MEMORY_MB,
  EXECUTOR_LAMBDA_TIMEOUT_SECONDS,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG,
  PREBUILT_BUNDLE_FILE_NAME,
  PREBUILT_INSTALL_LOCK_MAX_RETRIES,
  PREBUILT_INSTALL_LOCK_RETRY_MS,
  PREBUILT_INSTALL_LOCK_TTL_MS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { copyExecutor } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type ExecutorBuildContext = {
  flatLogicFunction: FlatLogicFunction;
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
};

export class LambdaExecutorManagerService {
  private readonly logger = new Logger(LambdaExecutorManagerService.name);

  constructor(
    private readonly options: Pick<LambdaDriverOptions, 'lambdaRole'>,
    private readonly awsClient: LambdaAwsClientService,
    private readonly layerManager: LambdaLayerManagerService,
    private readonly cacheLockService: CacheLockService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
  ) {}

  async getLambdaExecutor(
    flatLogicFunction: FlatLogicFunction,
  ): Promise<GetFunctionCommandOutput | undefined> {
    const lambdaClient = await this.awsClient.getLambdaClient();

    try {
      return await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: flatLogicFunction.id }),
      );
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return undefined;
      }

      throw error;
    }
  }

  async delete(flatLogicFunction: FlatLogicFunction): Promise<void> {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (!isDefined(lambdaExecutor)) {
      return;
    }

    const lambdaClient = await this.awsClient.getLambdaClient();

    await lambdaClient.send(
      new DeleteFunctionCommand({ FunctionName: flatLogicFunction.id }),
    );
  }

  async buildExecutor(context: ExecutorBuildContext): Promise<void> {
    const { canSkip } = await this.checkBuildStatus(context);

    if (canSkip) {
      return;
    }

    const buildLockTtlMs = 120_000;
    const buildLockRetryMs = 500;
    const buildLockMaxRetries = 240;

    await this.cacheLockService.withLock(
      async () => {
        // Need to check again inside the lock in case lock was not acquired immediately.
        const { canSkip: canSkipAfterLock, lambdaExecutor } =
          await this.checkBuildStatus(context);

        if (canSkipAfterLock) {
          return;
        }

        await this.ensureExecutor({ ...context, lambdaExecutor });
      },
      `lambda-build:${context.flatLogicFunction.id}`,
      {
        ttl: buildLockTtlMs,
        ms: buildLockRetryMs,
        maxRetries: buildLockMaxRetries,
      },
    );
  }

  async installPrebuiltBundle(context: ExecutorBuildContext): Promise<void> {
    const { flatLogicFunction, applicationUniversalIdentifier } = context;

    if (!isNonEmptyString(flatLogicFunction.checksum)) {
      throw new LogicFunctionException(
        `Cannot install prebuilt bundle for function '${flatLogicFunction.id}' without a checksum`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
      );
    }

    const checksum = flatLogicFunction.checksum;

    await this.buildExecutor(context);

    await this.cacheLockService.withLock(
      async () => {
        const compiledCode =
          await this.logicFunctionResourceService.getBuiltCode({
            workspaceId: flatLogicFunction.workspaceId,
            applicationUniversalIdentifier,
            builtHandlerPath: flatLogicFunction.builtHandlerPath,
          });

        const temporaryDirManager = new TemporaryDirManager();
        const { sourceTemporaryDir, lambdaZipPath } =
          await temporaryDirManager.init();

        try {
          await copyExecutor(sourceTemporaryDir);
          await fs.writeFile(
            join(sourceTemporaryDir, PREBUILT_BUNDLE_FILE_NAME),
            compiledCode,
            'utf8',
          );
          await createZipFile(sourceTemporaryDir, lambdaZipPath);

          const lambdaClient = await this.awsClient.getLambdaClient();

          const updateResult = await lambdaClient.send(
            new UpdateFunctionCodeCommand({
              FunctionName: flatLogicFunction.id,
              ZipFile: await fs.readFile(lambdaZipPath),
            }),
          );

          await this.awsClient.waitFunctionUpdated(flatLogicFunction.id);

          const functionArn = updateResult.FunctionArn;

          if (!isNonEmptyString(functionArn)) {
            throw new LogicFunctionException(
              `UpdateFunctionCode did not return a FunctionArn for '${flatLogicFunction.id}'`,
              LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
            );
          }

          await lambdaClient.send(
            new TagResourceCommand({
              Resource: functionArn,
              Tags: {
                [LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG]: checksum,
              },
            }),
          );
        } catch (error) {
          this.logger.error(
            `Failed to install prebuilt bundle for function ${flatLogicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
            error instanceof Error ? error.stack : undefined,
          );
          throw error;
        } finally {
          await temporaryDirManager.clean();
        }
      },
      `lambda-install:${flatLogicFunction.id}`,
      {
        ttl: PREBUILT_INSTALL_LOCK_TTL_MS,
        ms: PREBUILT_INSTALL_LOCK_RETRY_MS,
        maxRetries: PREBUILT_INSTALL_LOCK_MAX_RETRIES,
      },
    );
  }

  async getInstalledBundleChecksum(
    flatLogicFunction: FlatLogicFunction,
  ): Promise<string | null> {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (!isDefined(lambdaExecutor)) {
      return null;
    }

    return lambdaExecutor.Tags?.[LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG] ?? null;
  }

  private async checkBuildStatus(context: ExecutorBuildContext): Promise<{
    canSkip: boolean;
    lambdaExecutor: GetFunctionCommandOutput | undefined;
  }> {
    const { flatApplication, applicationUniversalIdentifier } = context;
    const lambdaExecutor = await this.getLambdaExecutor(
      context.flatLogicFunction,
    );

    const isActive = lambdaExecutor?.Configuration?.State === 'Active';

    const canSkip =
      isDefined(lambdaExecutor) &&
      isActive &&
      !flatApplication.isSdkLayerStale &&
      this.layerManager.hasExpectedLayers({
        lambdaExecutor,
        flatApplication,
        applicationUniversalIdentifier,
      });

    return { canSkip, lambdaExecutor };
  }

  private async ensureExecutor({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
    lambdaExecutor,
  }: ExecutorBuildContext & {
    lambdaExecutor: GetFunctionCommandOutput | undefined;
  }): Promise<void> {
    let depsLayerArn: string;

    try {
      depsLayerArn = await this.layerManager.ensureDepsLayer({
        flatApplication,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      this.logger.error(
        `Failed to get dependency layer for function ${flatLogicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new LogicFunctionException(
        `Failed to get dependency layer for function '${flatLogicFunction.id}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
      );
    }

    let sdkLayerArn: string;

    try {
      sdkLayerArn = await this.layerManager.ensureSdkLayer({
        flatApplication,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      this.logger.error(
        `Failed to get SDK layer for function ${flatLogicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new LogicFunctionException(
        `Failed to get SDK layer for function '${flatLogicFunction.id}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
      );
    }

    if (!isDefined(lambdaExecutor)) {
      await this.createExecutor({
        flatLogicFunction,
        depsLayerArn,
        sdkLayerArn,
      });
      await this.awsClient.waitFunctionActive(flatLogicFunction.id);

      return;
    }

    await this.updateExecutorConfiguration({
      flatLogicFunction,
      depsLayerArn,
      sdkLayerArn,
    });
    await this.awsClient.waitFunctionUpdated(flatLogicFunction.id);
  }

  private async updateExecutorConfiguration({
    flatLogicFunction,
    depsLayerArn,
    sdkLayerArn,
  }: {
    flatLogicFunction: FlatLogicFunction;
    depsLayerArn: string;
    sdkLayerArn: string;
  }): Promise<void> {
    const lambdaClient = await this.awsClient.getLambdaClient();

    await lambdaClient.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: flatLogicFunction.id,
        Layers: [depsLayerArn, sdkLayerArn],
        Runtime: flatLogicFunction.runtime,
        Timeout: EXECUTOR_LAMBDA_TIMEOUT_SECONDS,
        MemorySize: EXECUTOR_LAMBDA_MEMORY_MB,
      }),
    );
  }

  private async createExecutor({
    flatLogicFunction,
    depsLayerArn,
    sdkLayerArn,
  }: {
    flatLogicFunction: FlatLogicFunction;
    depsLayerArn: string;
    sdkLayerArn: string;
  }): Promise<void> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyExecutor(sourceTemporaryDir);
      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      // SDK layer listed last so it overwrites the stub twenty-client-sdk
      // from the deps layer (later layers take precedence in /opt merge).
      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: flatLogicFunction.id,
        Layers: [depsLayerArn, sdkLayerArn],
        Handler: 'index.handler',
        Role: this.options.lambdaRole,
        Runtime: flatLogicFunction.runtime,
        Timeout: EXECUTOR_LAMBDA_TIMEOUT_SECONDS,
        MemorySize: EXECUTOR_LAMBDA_MEMORY_MB,
        EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
      };

      const lambdaClient = await this.awsClient.getLambdaClient();

      await lambdaClient.send(new CreateFunctionCommand(params));
    } finally {
      await temporaryDirManager.clean();
    }
  }
}
