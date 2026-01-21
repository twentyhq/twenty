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
import { isDefined } from 'twenty-shared/utils';

import {
  type ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { copyExecutor } from 'src/engine/core-modules/serverless/drivers/utils/copy-executor';
import { createZipFile } from 'src/engine/core-modules/serverless/drivers/utils/create-zip-file';
import {
  LambdaBuildDirectoryManager,
  NODE_LAYER_SUBFOLDER,
} from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { type FlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/types/flat-serverless-function-layer.type';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
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

export class LambdaDriver implements ServerlessDriver {
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
    flatServerlessFunction: FlatServerlessFunction,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    const waitParams = {
      FunctionName: flatServerlessFunction.id,
    };

    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      waitParams,
    );
  }

  private getLayerName(
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer,
  ) {
    return flatServerlessFunctionLayer.checksum;
  }

  private async createLayerIfNotExists(
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer,
  ): Promise<string> {
    const layerName = this.getLayerName(flatServerlessFunctionLayer);

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

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await lambdaBuildDirectoryManager.init();

    const nodeDependenciesFolder = join(
      sourceTemporaryDir,
      NODE_LAYER_SUBFOLDER,
    );

    await copyAndBuildDependencies(
      nodeDependenciesFolder,
      flatServerlessFunctionLayer,
    );

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: PublishLayerVersionCommandInput = {
      LayerName: layerName,
      Content: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      CompatibleRuntimes: [
        ServerlessFunctionRuntime.NODE18,
        ServerlessFunctionRuntime.NODE22,
      ],
    };

    const command = new PublishLayerVersionCommand(params);

    const result = await (await this.getLambdaClient()).send(command);

    await lambdaBuildDirectoryManager.clean();

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('new layer version arn if undefined');
    }

    return result.LayerVersionArn;
  }

  private async getLambdaExecutor(
    flatServerlessFunction: FlatServerlessFunction,
  ) {
    try {
      const getFunctionCommand: GetFunctionCommand = new GetFunctionCommand({
        FunctionName: flatServerlessFunction.id,
      });

      return await (await this.getLambdaClient()).send(getFunctionCommand);
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  }

  async delete(flatServerlessFunction: FlatServerlessFunction) {
    const lambdaExecutor = await this.getLambdaExecutor(flatServerlessFunction);

    if (isDefined(lambdaExecutor)) {
      const deleteFunctionCommand = new DeleteFunctionCommand({
        FunctionName: flatServerlessFunction.id,
      });

      await (await this.getLambdaClient()).send(deleteFunctionCommand);
    }
  }

  private async isAlreadyBuilt(
    flatServerlessFunction: FlatServerlessFunction,
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer,
  ) {
    const lambdaExecutor = await this.getLambdaExecutor(flatServerlessFunction);

    if (!isDefined(lambdaExecutor)) {
      return false;
    }

    const layers = lambdaExecutor.Configuration?.Layers;

    if (!isDefined(layers) || layers.length !== 1) {
      await this.delete(flatServerlessFunction);

      return false;
    }

    const layerName = this.getLayerName(flatServerlessFunctionLayer);

    if (layers[0].Arn?.includes(layerName)) {
      return true;
    }

    await this.delete(flatServerlessFunction);

    return false;
  }

  private async build(
    flatServerlessFunction: FlatServerlessFunction,
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer,
  ) {
    if (
      await this.isAlreadyBuilt(
        flatServerlessFunction,
        flatServerlessFunctionLayer,
      )
    ) {
      return;
    }

    const layerArn = await this.createLayerIfNotExists(
      flatServerlessFunctionLayer,
    );

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await lambdaBuildDirectoryManager.init();

    await copyExecutor(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      FunctionName: flatServerlessFunction.id,
      Layers: [layerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: flatServerlessFunction.runtime,
      Timeout: 900, // timeout is handled by the serverless function service
    };

    const command = new CreateFunctionCommand(params);

    await (await this.getLambdaClient()).send(command);

    await lambdaBuildDirectoryManager.clean();
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
    flatServerlessFunction,
    flatServerlessFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatServerlessFunction: FlatServerlessFunction;
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult> {
    await this.build(flatServerlessFunction, flatServerlessFunctionLayer);

    await this.waitFunctionUpdates(flatServerlessFunction);

    const startTime = Date.now();

    const folderPath = getServerlessFolderOrThrow({
      flatServerlessFunction,
      version,
    });

    const compiledCode = (
      await streamToBuffer(
        await this.fileStorageService.read({
          folderPath,
          filename: DEFAULT_BUILT_HANDLER_PATH,
        }),
      )
    ).toString('utf-8');

    const executorPayload: LambdaDriverExecutorPayload = {
      params: payload,
      code: compiledCode,
      env: env ?? {},
      handlerName: flatServerlessFunction.handlerName,
    };

    const params: InvokeCommandInput = {
      FunctionName: flatServerlessFunction.id,
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
          status: ServerlessFunctionExecutionStatus.ERROR,
          error: parsedResult,
          logs,
        };
      }

      return {
        data: parsedResult,
        logs,
        duration,
        status: ServerlessFunctionExecutionStatus.SUCCESS,
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new ServerlessFunctionException(
          `Function Version '${version}' does not exist`,
          ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
