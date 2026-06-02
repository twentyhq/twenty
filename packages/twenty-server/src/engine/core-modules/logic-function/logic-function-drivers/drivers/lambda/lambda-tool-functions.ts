import * as fs from 'fs/promises';
import { join } from 'path';

import {
  CreateFunctionCommand,
  type CreateFunctionCommandInput,
  GetFunctionCommand,
  InvokeCommand,
  LogType,
  PublishLayerVersionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { COMMON_LAYER_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/common-layer-dependencies-dirname';
import {
  BUILDER_FUNCTION_NAME_PREFIX,
  BUILDER_HANDLER_PATH,
  BUILDER_LAMBDA_MEMORY_MB,
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  COMMON_LAYER_NAME_PREFIX,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  YARN_INSTALL_FUNCTION_NAME_PREFIX,
  YARN_INSTALL_HANDLER_PATH,
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-driver.constants';
import {
  type BuilderLambdaPayload,
  type BuilderLambdaResult,
  type LambdaDriverOptions,
  type YarnInstallLambdaPayload,
  type YarnInstallLambdaResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-driver.types';
import { computeHashedResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-resource-name';
import { type LambdaAwsClient } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-aws-client';
import { copyBuilder } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-builder';
import { copyCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-common-layer-dependencies';
import { copyYarnInstall } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-yarn-install';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type ToolLambdaSpec = {
  functionName: string;
  commonLayerArn: string;
  copySources: (sourceTemporaryDir: string) => Promise<void>;
  timeoutSeconds: number;
  memoryMb: number;
};

export class LambdaToolFunctions {
  private commonLayerName: string | undefined;
  private yarnInstallFunctionName: string | undefined;
  private builderFunctionName: string | undefined;

  constructor(
    private readonly options: Pick<LambdaDriverOptions, 'lambdaRole'>,
    private readonly awsClient: LambdaAwsClient,
  ) {}

  async transpile(
    params: Omit<BuilderLambdaPayload, 'action'>,
  ): Promise<BuilderLambdaResult> {
    await this.ensureBuilderLambdaExists();

    const builderFunctionName = await this.getBuilderFunctionName();
    const lambdaClient = await this.awsClient.getLambdaClient();

    const payload: BuilderLambdaPayload = {
      action: 'transpile',
      ...params,
    };

    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: builderFunctionName,
        Payload: JSON.stringify(payload),
        LogType: LogType.Tail,
      }),
      {
        abortSignal: AbortSignal.timeout(BUILDER_LAMBDA_TIMEOUT_SECONDS * 1000),
      },
    );

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const userCompilationErrorRegex = /^Build failed with \d+ error/;
      const isUserCompilationError =
        isNonEmptyString(parsedResult?.errorMessage) &&
        userCompilationErrorRegex.test(parsedResult.errorMessage);

      if (isUserCompilationError) {
        throw new LogicFunctionException(
          `Function code compilation failed: ${parsedResult.errorMessage}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
        );
      }

      throw new LogicFunctionException(
        `Builder Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const parsedResult: BuilderLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.builtCode) {
      throw new Error('Builder Lambda did not return builtCode');
    }

    return parsedResult;
  }

  async runYarnInstallCreateLayer(
    params: Omit<YarnInstallLambdaPayload, 'action'>,
  ): Promise<YarnInstallLambdaResult> {
    await this.ensureYarnInstallLambdaExists();

    const lambdaClient = await this.awsClient.getLambdaClient();
    const yarnInstallFunctionName = await this.getYarnInstallFunctionName();

    const payload: YarnInstallLambdaPayload = {
      action: 'createLayer',
      ...params,
    };

    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: yarnInstallFunctionName,
        Payload: JSON.stringify(payload),
        LogType: LogType.Tail,
      }),
      {
        abortSignal: AbortSignal.timeout(
          YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS * 1000,
        ),
      },
    );

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      throw new LogicFunctionException(
        `Yarn install Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const parsedResult: YarnInstallLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.success) {
      throw new Error('Yarn install Lambda did not report success');
    }

    return parsedResult;
  }

  async ensureCommonLayerExists(): Promise<string> {
    const commonLayerName = await this.getCommonLayerName();
    const existingArn = await this.awsClient.getExistingLayerArn(
      commonLayerName,
    );

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyCommonLayerDependencies(sourceTemporaryDir);
      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const lambdaClient = await this.awsClient.getLambdaClient();

      const result = await lambdaClient.send(
        new PublishLayerVersionCommand({
          LayerName: commonLayerName,
          Content: { ZipFile: await fs.readFile(lambdaZipPath) },
          CompatibleRuntimes: [
            LogicFunctionRuntime.NODE18,
            LogicFunctionRuntime.NODE22,
          ],
        }),
      );

      if (!result.LayerVersionArn) {
        throw new Error(
          'PublishLayerVersion did not return a LayerVersionArn for common layer',
        );
      }

      return result.LayerVersionArn;
    } finally {
      await temporaryDirManager.clean();
    }
  }

  private async ensureYarnInstallLambdaExists(): Promise<void> {
    const yarnInstallFunctionName = await this.getYarnInstallFunctionName();

    if (await this.toolLambdaExists(yarnInstallFunctionName)) {
      return;
    }

    const commonLayerArn = await this.ensureCommonLayerExists();

    await this.createToolLambda({
      functionName: yarnInstallFunctionName,
      commonLayerArn,
      copySources: copyYarnInstall,
      timeoutSeconds: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
      memoryMb: YARN_INSTALL_LAMBDA_MEMORY_MB,
    });
  }

  private async ensureBuilderLambdaExists(): Promise<void> {
    const builderFunctionName = await this.getBuilderFunctionName();

    if (await this.toolLambdaExists(builderFunctionName)) {
      return;
    }

    const commonLayerArn = await this.ensureCommonLayerExists();

    await this.createToolLambda({
      functionName: builderFunctionName,
      commonLayerArn,
      copySources: copyBuilder,
      timeoutSeconds: BUILDER_LAMBDA_TIMEOUT_SECONDS,
      memoryMb: BUILDER_LAMBDA_MEMORY_MB,
    });
  }

  private async toolLambdaExists(functionName: string): Promise<boolean> {
    const lambdaClient = await this.awsClient.getLambdaClient();

    try {
      await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: functionName }),
      );

      return true;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return false;
      }

      throw error;
    }
  }

  private async createToolLambda(spec: ToolLambdaSpec): Promise<void> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await spec.copySources(sourceTemporaryDir);
      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: spec.functionName,
        Layers: [spec.commonLayerArn],
        Handler: 'index.handler',
        Role: this.options.lambdaRole,
        Runtime: LogicFunctionRuntime.NODE22,
        Timeout: spec.timeoutSeconds,
        MemorySize: spec.memoryMb,
        EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
      };

      const lambdaClient = await this.awsClient.getLambdaClient();

      await lambdaClient.send(new CreateFunctionCommand(params));
    } finally {
      await temporaryDirManager.clean();
    }

    await this.awsClient.waitFunctionActive(spec.functionName);
  }

  private async getCommonLayerName(): Promise<string> {
    if (isDefined(this.commonLayerName)) {
      return this.commonLayerName;
    }

    const [packageJson, yarnLock] = await Promise.all([
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'package.json'),
        'utf-8',
      ),
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'yarn.lock'),
        'utf-8',
      ),
    ]);

    this.commonLayerName = computeHashedResourceName({
      prefix: COMMON_LAYER_NAME_PREFIX,
      contents: [packageJson, yarnLock],
    });

    return this.commonLayerName;
  }

  private async getYarnInstallFunctionName(): Promise<string> {
    if (isDefined(this.yarnInstallFunctionName)) {
      return this.yarnInstallFunctionName;
    }

    const handlerContent = await fs.readFile(
      YARN_INSTALL_HANDLER_PATH,
      'utf-8',
    );

    this.yarnInstallFunctionName = computeHashedResourceName({
      prefix: YARN_INSTALL_FUNCTION_NAME_PREFIX,
      contents: [handlerContent],
    });

    return this.yarnInstallFunctionName;
  }

  private async getBuilderFunctionName(): Promise<string> {
    if (isDefined(this.builderFunctionName)) {
      return this.builderFunctionName;
    }

    const handlerContent = await fs.readFile(BUILDER_HANDLER_PATH, 'utf-8');

    this.builderFunctionName = computeHashedResourceName({
      prefix: BUILDER_FUNCTION_NAME_PREFIX,
      contents: [handlerContent],
    });

    return this.builderFunctionName;
  }
}
