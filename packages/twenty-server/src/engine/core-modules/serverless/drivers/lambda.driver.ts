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
import { buildServerlessFunctionInMemory } from 'src/engine/core-modules/serverless/drivers/utils/build-serverless-function-in-memory';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { copyExecutor } from 'src/engine/core-modules/serverless/drivers/utils/copy-executor';
import { createZipFile } from 'src/engine/core-modules/serverless/drivers/utils/create-zip-file';
import { formatBuildError } from 'src/engine/core-modules/serverless/drivers/utils/format-build-error';
import {
  LambdaBuildDirectoryManager,
  NODE_LAYER_SUBFOLDER,
} from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  type ServerlessFunctionEntity,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

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
    serverlessFunction: ServerlessFunctionEntity,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    const waitParams = {
      FunctionName: serverlessFunction.id,
    };

    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      waitParams,
    );
  }

  private getLayerName(serverlessFunction: ServerlessFunctionEntity) {
    return serverlessFunction.serverlessFunctionLayer.checksum;
  }

  private async createLayerIfNotExists(
    serverlessFunction: ServerlessFunctionEntity,
  ): Promise<string> {
    const layerName = this.getLayerName(serverlessFunction);

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

    await copyAndBuildDependencies(nodeDependenciesFolder, serverlessFunction);

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
    serverlessFunction: ServerlessFunctionEntity,
  ) {
    try {
      const getFunctionCommand: GetFunctionCommand = new GetFunctionCommand({
        FunctionName: serverlessFunction.id,
      });

      return await (await this.getLambdaClient()).send(getFunctionCommand);
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  }

  async delete(serverlessFunction: ServerlessFunctionEntity) {
    const lambdaExecutor = await this.getLambdaExecutor(serverlessFunction);

    if (isDefined(lambdaExecutor)) {
      const deleteFunctionCommand = new DeleteFunctionCommand({
        FunctionName: serverlessFunction.id,
      });

      await (await this.getLambdaClient()).send(deleteFunctionCommand);
    }
  }

  private async isAlreadyBuilt(serverlessFunction: ServerlessFunctionEntity) {
    const lambdaExecutor = await this.getLambdaExecutor(serverlessFunction);

    if (!isDefined(lambdaExecutor)) {
      return false;
    }

    const layers = lambdaExecutor.Configuration?.Layers;

    if (!isDefined(layers) || layers.length !== 1) {
      await this.delete(serverlessFunction);

      return false;
    }

    const layerName = this.getLayerName(serverlessFunction);

    if (layers[0].Arn?.includes(layerName)) {
      return true;
    }

    await this.delete(serverlessFunction);

    return false;
  }

  private async build(serverlessFunction: ServerlessFunctionEntity) {
    if (await this.isAlreadyBuilt(serverlessFunction)) {
      return;
    }

    const layerArn = await this.createLayerIfNotExists(serverlessFunction);

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await lambdaBuildDirectoryManager.init();

    await copyExecutor(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      FunctionName: serverlessFunction.id,
      Layers: [layerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: serverlessFunction.runtime,
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
    serverlessFunction,
    payload,
    version,
    env,
  }: {
    serverlessFunction: ServerlessFunctionEntity;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult> {
    await this.build(serverlessFunction);
    await this.waitFunctionUpdates(serverlessFunction);

    const startTime = Date.now();

    const folderPath = getServerlessFolder({
      serverlessFunction,
      version,
    });

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.fileStorageService.download({
        from: { folderPath },
        to: { folderPath: sourceTemporaryDir },
      });

      let builtBundleFilePath = '';

      try {
        builtBundleFilePath = await buildServerlessFunctionInMemory({
          sourceTemporaryDir,
          handlerPath: serverlessFunction.handlerPath,
        });
      } catch (error) {
        return formatBuildError(error, startTime);
      }

      const compiledCode = (await fs.readFile(builtBundleFilePath)).toString(
        'utf-8',
      );

      const executorPayload: LambdaDriverExecutorPayload = {
        params: payload,
        code: compiledCode,
        env: env ?? {},
        handlerName: serverlessFunction.handlerName,
      };

      const params: InvokeCommandInput = {
        FunctionName: serverlessFunction.id,
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
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }
}
