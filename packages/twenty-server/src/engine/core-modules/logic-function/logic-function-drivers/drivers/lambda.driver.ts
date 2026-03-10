import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { resolve, join } from 'path';

import {
  CreateFunctionCommand,
  type CreateFunctionCommandInput,
  DeleteFunctionCommand,
  GetFunctionCommand,
  InvokeCommand,
  type InvokeCommandInput,
  Lambda,
  type LambdaClientConfig,
  ListLayerVersionsCommand,
  type ListLayerVersionsCommandInput,
  LogType,
  PublishLayerVersionCommand,
  ResourceNotFoundException,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { isDefined } from 'twenty-shared/utils';

import {
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionDriver,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { ASSET_PATH } from 'src/constants/assets-path';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { copyBuilder } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-builder';
import { copyCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-common-layer-dependencies';
import { copyExecutor } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor';
import { copyTranspiler } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-transpiler';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { callWithTimeout } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/call-with-timeout';

const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h
const BUILDER_LAMBDA_TIMEOUT_SECONDS = 300;
const BUILDER_LAMBDA_MEMORY_MB = 1024;
const COMMON_LAYER_NAME = 'twenty-common-layer-dependencies';
const TRANSPILER_LAMBDA_TIMEOUT_SECONDS = 60;
const TRANSPILER_LAMBDA_MEMORY_MB = 512;

const BUILDER_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/builder/index.mjs',
  ),
);

const TRANSPILER_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/transpiler/index.mjs',
  ),
);

type LambdaDriverExecutorPayload = {
  code: string;
  params: object;
  env: Record<string, string>;
  handlerName: string;
};

export type BuilderLambdaPayload = {
  action: 'createLayer';
  packageJson: string;
  yarnLock: string;
};

export type BuilderLambdaResult = {
  zipBase64: string;
};

export type TranspilerLambdaPayload = {
  action: 'transpile';
  sourceCode: string;
  sourceFileName: string;
  builtFileName: string;
};

export type TranspilerLambdaResult = {
  builtCode: string;
};

export interface LambdaDriverOptions extends LambdaClientConfig {
  logicFunctionResourceService: LogicFunctionResourceService;
  region: string;
  lambdaRole: string;
  subhostingRole?: string;
}

export class LambdaDriver implements LogicFunctionDriver {
  private lambdaClient: Lambda | undefined;
  private credentialsExpiry: Date | null = null;
  private readonly options: LambdaDriverOptions;
  private readonly logicFunctionResourceService: LogicFunctionResourceService;

  constructor(options: LambdaDriverOptions) {
    this.options = options;
    this.lambdaClient = undefined;
    this.logicFunctionResourceService = options.logicFunctionResourceService;
  }

  private async getLambdaClient() {
    if (
      !isDefined(this.lambdaClient) ||
      (isDefined(this.options.subhostingRole) &&
        isDefined(this.credentialsExpiry) &&
        new Date() >= this.credentialsExpiry)
    ) {
      this.lambdaClient = new Lambda({
        ...this.options,
        ...(isDefined(this.options.subhostingRole) && {
          credentials: await this.getAssumeRoleCredentials(),
        }),
      });
    }

    return this.lambdaClient;
  }

  private async getAssumeRoleCredentials() {
    const stsClient = new STSClient({ region: this.options.region });

    this.credentialsExpiry = new Date(
      Date.now() + (CREDENTIALS_DURATION_IN_SECONDS - 60 * 5) * 1000,
    );

    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: this.options.subhostingRole,
      RoleSessionName: 'LambdaSession',
      DurationSeconds: CREDENTIALS_DURATION_IN_SECONDS,
    });

    const { Credentials } = await stsClient.send(assumeRoleCommand);

    if (
      !isDefined(Credentials) ||
      !isDefined(Credentials.AccessKeyId) ||
      !isDefined(Credentials.SecretAccessKey) ||
      !isDefined(Credentials.SessionToken)
    ) {
      throw new Error('Failed to assume role');
    }

    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };
  }

  private async waitFunctionUpdates(
    functionName: string,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    const waitParams = {
      FunctionName: functionName,
    };

    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      waitParams,
    );
  }

  private getLayerName(flatApplication: FlatApplication) {
    return flatApplication.yarnLockChecksum ?? 'default';
  }

  private builderFunctionName: string | undefined;
  private transpilerFunctionName: string | undefined;

  private async getBuilderFunctionName(): Promise<string> {
    if (isDefined(this.builderFunctionName)) {
      return this.builderFunctionName;
    }

    const handlerContent = await fs.readFile(BUILDER_HANDLER_PATH, 'utf-8');
    const checksum = createHash('sha256')
      .update(handlerContent)
      .digest('hex')
      .slice(0, 12);

    this.builderFunctionName = `twenty-builder-${checksum}`;

    return this.builderFunctionName;
  }

  private async getTranspilerFunctionName(): Promise<string> {
    if (isDefined(this.transpilerFunctionName)) {
      return this.transpilerFunctionName;
    }

    const handlerContent = await fs.readFile(TRANSPILER_HANDLER_PATH, 'utf-8');
    const checksum = createHash('sha256')
      .update(handlerContent)
      .digest('hex')
      .slice(0, 12);

    this.transpilerFunctionName = `twenty-transpiler-${checksum}`;

    return this.transpilerFunctionName;
  }

  private async ensureCommonLayerExists(): Promise<string> {
    const existingArn = await this.getExistingLayerArn(COMMON_LAYER_NAME);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    await copyCommonLayerDependencies(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const lambdaClient = await this.getLambdaClient();

    const result = await lambdaClient.send(
      new PublishLayerVersionCommand({
        LayerName: COMMON_LAYER_NAME,
        Content: { ZipFile: await fs.readFile(lambdaZipPath) },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    await temporaryDirManager.clean();

    if (!result.LayerVersionArn) {
      throw new Error(
        'PublishLayerVersion did not return a LayerVersionArn for common layer',
      );
    }

    return result.LayerVersionArn;
  }

  private async ensureBuilderLambdaExists(): Promise<void> {
    const builderFunctionName = await this.getBuilderFunctionName();
    const lambdaClient = await this.getLambdaClient();

    try {
      await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: builderFunctionName }),
      );

      return;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }

    const commonLayerArn = await this.ensureCommonLayerExists();

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    await copyBuilder(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      FunctionName: builderFunctionName,
      Layers: [commonLayerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: LogicFunctionRuntime.NODE22,
      Timeout: BUILDER_LAMBDA_TIMEOUT_SECONDS,
      MemorySize: BUILDER_LAMBDA_MEMORY_MB,
    };

    await lambdaClient.send(new CreateFunctionCommand(params));

    await temporaryDirManager.clean();

    await this.waitFunctionUpdates(builderFunctionName);
  }

  private async invokeBuilderLambda(
    payload: BuilderLambdaPayload,
  ): Promise<BuilderLambdaResult> {
    const lambdaClient = await this.getLambdaClient();

    const builderFunctionName = await this.getBuilderFunctionName();

    const result = await callWithTimeout({
      callback: () =>
        lambdaClient.send(
          new InvokeCommand({
            FunctionName: builderFunctionName,
            Payload: JSON.stringify(payload),
            LogType: LogType.Tail,
          }),
        ),
      timeoutMs: BUILDER_LAMBDA_TIMEOUT_SECONDS * 1000,
    });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      throw new LogicFunctionException(
        `Builder Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const parsedResult: BuilderLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.zipBase64) {
      throw new Error('Builder Lambda did not return zipBase64');
    }

    return parsedResult;
  }

  private async ensureTranspilerLambdaExists(): Promise<void> {
    const transpilerFunctionName = await this.getTranspilerFunctionName();
    const lambdaClient = await this.getLambdaClient();

    try {
      await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: transpilerFunctionName }),
      );

      return;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    await copyTranspiler(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const commonLayerArn = await this.ensureCommonLayerExists();

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      FunctionName: transpilerFunctionName,
      Layers: [commonLayerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: LogicFunctionRuntime.NODE22,
      Timeout: TRANSPILER_LAMBDA_TIMEOUT_SECONDS,
      MemorySize: TRANSPILER_LAMBDA_MEMORY_MB,
    };

    await lambdaClient.send(new CreateFunctionCommand(params));

    await temporaryDirManager.clean();

    await this.waitFunctionUpdates(transpilerFunctionName);
  }

  async transpile({
    sourceCode,
    sourceFileName,
    builtFileName,
  }: LogicFunctionTranspileParams): Promise<LogicFunctionTranspileResult> {
    await this.ensureTranspilerLambdaExists();

    const lambdaClient = await this.getLambdaClient();
    const transpilerFunctionName = await this.getTranspilerFunctionName();

    const payload: TranspilerLambdaPayload = {
      action: 'transpile',
      sourceCode,
      sourceFileName,
      builtFileName,
    };

    const result = await callWithTimeout({
      callback: () =>
        lambdaClient.send(
          new InvokeCommand({
            FunctionName: transpilerFunctionName,
            Payload: JSON.stringify(payload),
            LogType: LogType.Tail,
          }),
        ),
      timeoutMs: TRANSPILER_LAMBDA_TIMEOUT_SECONDS * 1000,
    });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      throw new LogicFunctionException(
        `Transpiler Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const parsedResult: TranspilerLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.builtCode) {
      throw new Error('Transpiler Lambda did not return builtCode');
    }

    return { builtCode: parsedResult.builtCode };
  }

  private async getExistingLayerArn(
    layerName: string,
  ): Promise<string | undefined> {
    const listLayerParams: ListLayerVersionsCommandInput = {
      LayerName: layerName,
      MaxItems: 1,
    };

    const listLayerResult = await (
      await this.getLambdaClient()
    ).send(new ListLayerVersionsCommand(listLayerParams));

    return listLayerResult.LayerVersions?.[0]?.LayerVersionArn;
  }

  private async getDependencyContents(
    flatApplication: FlatApplication,
    applicationUniversalIdentifier: string,
  ): Promise<{ packageJson: string; yarnLock: string }> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir } = await temporaryDirManager.init();

    await this.logicFunctionResourceService.copyDependenciesInMemory({
      applicationUniversalIdentifier,
      workspaceId: flatApplication.workspaceId,
      inMemoryFolderPath: sourceTemporaryDir,
    });

    const [packageJson, yarnLock] = await Promise.all([
      fs.readFile(`${sourceTemporaryDir}/package.json`, 'utf-8'),
      fs.readFile(`${sourceTemporaryDir}/yarn.lock`, 'utf-8'),
    ]);

    await temporaryDirManager.clean();

    return { packageJson, yarnLock };
  }

  private async createLayerIfNotExist({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const layerName = this.getLayerName(flatApplication);

    const existingArn = await this.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return;
    }

    const { packageJson, yarnLock } = await this.getDependencyContents(
      flatApplication,
      applicationUniversalIdentifier,
    );

    await this.ensureBuilderLambdaExists();

    const { zipBase64 } = await this.invokeBuilderLambda({
      action: 'createLayer',
      packageJson,
      yarnLock,
    });

    const lambdaClient = await this.getLambdaClient();

    const publishResult = await lambdaClient.send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: { ZipFile: Buffer.from(zipBase64, 'base64') },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    if (!publishResult.LayerVersionArn) {
      throw new Error(
        `PublishLayerVersion did not return a LayerVersionArn for layer '${layerName}'`,
      );
    }
  }

  private async getLayerArn({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const layerName = this.getLayerName(flatApplication);

    const existingArn = await this.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    await this.createLayerIfNotExist({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const newArn = await this.getExistingLayerArn(layerName);

    if (!isDefined(newArn)) {
      throw new Error(
        `Layer '${layerName}' was not created by the builder Lambda`,
      );
    }

    return newArn;
  }

  private async getLambdaExecutor(flatLogicFunction: FlatLogicFunction) {
    try {
      const getFunctionCommand: GetFunctionCommand = new GetFunctionCommand({
        FunctionName: flatLogicFunction.id,
      });

      return await (await this.getLambdaClient()).send(getFunctionCommand);
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  }

  async delete(flatLogicFunction: FlatLogicFunction) {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (isDefined(lambdaExecutor)) {
      const deleteFunctionCommand = new DeleteFunctionCommand({
        FunctionName: flatLogicFunction.id,
      });

      await (await this.getLambdaClient()).send(deleteFunctionCommand);
    }
  }

  private async isAlreadyBuilt(
    flatLogicFunction: FlatLogicFunction,
    flatApplication: FlatApplication,
  ) {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (!isDefined(lambdaExecutor)) {
      return false;
    }

    const layers = lambdaExecutor.Configuration?.Layers;

    if (!isDefined(layers) || layers.length !== 1) {
      await this.delete(flatLogicFunction);

      return false;
    }

    const layerName = this.getLayerName(flatApplication);

    if (layers[0].Arn?.includes(layerName)) {
      return true;
    }

    await this.delete(flatLogicFunction);

    return false;
  }

  private async build({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    if (await this.isAlreadyBuilt(flatLogicFunction, flatApplication)) {
      return;
    }

    const layerArn = await this.getLayerArn({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const temporaryDirManager = new TemporaryDirManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    await copyExecutor(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      FunctionName: flatLogicFunction.id,
      Layers: [layerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: flatLogicFunction.runtime,
      Timeout: 900, // timeout is handled by the logic function service
    };

    const command = new CreateFunctionCommand(params);

    await (await this.getLambdaClient()).send(command);

    await temporaryDirManager.clean();
  }

  private extractLogs(logString: string): string {
    const formattedLogString = Buffer.from(logString, 'base64')
      .toString('utf8')
      .split('\t')
      .join(' ');

    return formattedLogString
      .replace(/^(START|END|REPORT).*\n?/gm, '')
      .replace(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) [a-f0-9-]+ INFO /gm,
        '$1 INFO ',
      )
      .trim();
  }

  async execute({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
    payload,
    env,
    timeoutMs = 900_000,
  }: LogicFunctionExecuteParams): Promise<LogicFunctionExecuteResult> {
    await this.build({
      flatLogicFunction,
      flatApplication,
      applicationUniversalIdentifier,
    });

    await this.waitFunctionUpdates(flatLogicFunction.id);

    const startTime = Date.now();

    const compiledCode = await this.logicFunctionResourceService.getBuiltCode({
      workspaceId: flatLogicFunction.workspaceId,
      applicationUniversalIdentifier,
      builtHandlerPath: flatLogicFunction.builtHandlerPath,
    });

    const executorPayload: LambdaDriverExecutorPayload = {
      params: payload,
      code: compiledCode,
      env: env ?? {},
      handlerName: flatLogicFunction.handlerName,
    };

    const params: InvokeCommandInput = {
      FunctionName: flatLogicFunction.id,
      Payload: JSON.stringify(executorPayload),
      LogType: LogType.Tail,
    };

    const command = new InvokeCommand(params);

    try {
      const lambdaClient = await this.getLambdaClient();

      const result = await callWithTimeout({
        callback: () => lambdaClient.send(command),
        timeoutMs,
      });

      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const logs = result.LogResult ? this.extractLogs(result.LogResult) : '';

      const duration = Date.now() - startTime;

      if (result.FunctionError) {
        return {
          data: null,
          duration,
          status: LogicFunctionExecutionStatus.ERROR,
          error: parsedResult,
          logs,
        };
      }

      return {
        data: parsedResult,
        logs,
        duration,
        status: LogicFunctionExecutionStatus.SUCCESS,
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new LogicFunctionException(
          `Function '${flatLogicFunction.id}' does not exist`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
