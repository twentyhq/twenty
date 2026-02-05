import * as fs from 'fs/promises';
import { join } from 'path';

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
  type PublishLayerVersionCommandInput,
  ResourceNotFoundException,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionExecutorDriver,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-executor-driver.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { NODE_LAYER_SUBFOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/lambda-layer.constant';
import { copyExecutor } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor';
import { copyYarnEngineAndBuildDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-yarn-engine-and-build-dependencies';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h

type LambdaDriverExecutorPayload = {
  code: string;
  params: object;
  env: Record<string, string>;
  handlerName: string;
};

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileStorageService: FileStorageService;
  region: string;
  lambdaRole: string;
  subhostingRole?: string;
}

export class LambdaDriver implements LogicFunctionExecutorDriver {
  private lambdaClient: Lambda | undefined;
  private credentialsExpiry: Date | null = null;
  private readonly options: LambdaDriverOptions;
  private readonly fileStorageService: FileStorageService;

  constructor(options: LambdaDriverOptions) {
    this.options = options;
    this.lambdaClient = undefined;
    this.fileStorageService = options.fileStorageService;
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
    flatLogicFunction: FlatLogicFunction,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    const waitParams = {
      FunctionName: flatLogicFunction.id,
    };

    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      waitParams,
    );
  }

  private getLayerName(flatApplication: FlatApplication) {
    return flatApplication.yarnLockChecksum ?? 'default';
  }

  private async copyDependenciesInMemory({
    applicationUniversalIdentifier,
    workspaceId,
    inMemoryLayerFolderPath,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
    inMemoryLayerFolderPath: string;
  }) {
    await Promise.all([
      this.fileStorageService.downloadFile_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'package.json',
        localPath: join(inMemoryLayerFolderPath, 'package.json'),
      }),
      this.fileStorageService.downloadFile_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'yarn.lock',
        localPath: join(inMemoryLayerFolderPath, 'yarn.lock'),
      }),
    ]);
  }

  private async createLayerIfNotExists({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const layerName = this.getLayerName(flatApplication);

    const listLayerParams: ListLayerVersionsCommandInput = {
      LayerName: layerName,
      MaxItems: 1,
    };

    const listLayerCommand = new ListLayerVersionsCommand(listLayerParams);

    const listLayerResult = await (
      await this.getLambdaClient()
    ).send(listLayerCommand);

    if (isDefined(listLayerResult.LayerVersions?.[0]?.LayerVersionArn)) {
      return listLayerResult.LayerVersions[0].LayerVersionArn;
    }

    const buildTemporaryDirectoryManager = new LambdaBuildDirectoryManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await buildTemporaryDirectoryManager.init();

    const nodeDependenciesFolder = join(
      sourceTemporaryDir,
      NODE_LAYER_SUBFOLDER,
    );

    await this.copyDependenciesInMemory({
      applicationUniversalIdentifier,
      workspaceId: flatApplication.workspaceId,
      inMemoryLayerFolderPath: nodeDependenciesFolder,
    });
    await copyYarnEngineAndBuildDependencies(nodeDependenciesFolder);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: PublishLayerVersionCommandInput = {
      LayerName: layerName,
      Content: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      CompatibleRuntimes: [
        LogicFunctionRuntime.NODE18,
        LogicFunctionRuntime.NODE22,
      ],
    };

    const command = new PublishLayerVersionCommand(params);

    const result = await (await this.getLambdaClient()).send(command);

    await buildTemporaryDirectoryManager.clean();

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('new layer version arn if undefined');
    }

    return result.LayerVersionArn;
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

    const layerArn = await this.createLayerIfNotExists({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const buildTemporaryDirectoryManager = new LambdaBuildDirectoryManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await buildTemporaryDirectoryManager.init();

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

    await buildTemporaryDirectoryManager.clean();
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
  }: LogicFunctionExecuteParams): Promise<LogicFunctionExecuteResult> {
    await this.build({
      flatLogicFunction,
      flatApplication,
      applicationUniversalIdentifier,
    });

    await this.waitFunctionUpdates(flatLogicFunction);

    const startTime = Date.now();

    const compiledCode = (
      await streamToBuffer(
        await this.fileStorageService.readFile_v2({
          workspaceId: flatLogicFunction.workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.BuiltLogicFunction,
          resourcePath: flatLogicFunction.builtHandlerPath,
        }),
      )
    ).toString('utf-8');

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
      const result = await (await this.getLambdaClient()).send(command);

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
