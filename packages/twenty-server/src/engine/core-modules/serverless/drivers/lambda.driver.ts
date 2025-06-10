import * as fs from 'fs/promises';
import { join } from 'path';

import {
  CreateFunctionCommand,
  CreateFunctionCommandInput,
  DeleteFunctionCommand,
  GetFunctionCommand,
  InvokeCommand,
  InvokeCommandInput,
  Lambda,
  LambdaClientConfig,
  ListLayerVersionsCommand,
  ListLayerVersionsCommandInput,
  LogType,
  PublishLayerVersionCommand,
  PublishLayerVersionCommandInput,
  ResourceNotFoundException,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { isDefined } from 'twenty-shared/utils';
import ts, { transpileModule } from 'typescript';

import {
  ServerlessDriver,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/core-modules/file-storage/utils/read-file-content';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { copyExecutor } from 'src/engine/core-modules/serverless/drivers/utils/copy-executor';
import { createZipFile } from 'src/engine/core-modules/serverless/drivers/utils/create-zip-file';
import {
  LambdaBuildDirectoryManager,
  NODE_LAYER_SUBFOLDER,
} from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h
const LAMBDA_EXECUTOR_DESCRIPTION = 'User script executor';

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

  private async createLayerIfNotExists(version: number): Promise<string> {
    const listLayerParams: ListLayerVersionsCommandInput = {
      LayerName: COMMON_LAYER_NAME,
      MaxItems: 1,
    };
    const listLayerCommand = new ListLayerVersionsCommand(listLayerParams);
    const listLayerResult = await (
      await this.getLambdaClient()
    ).send(listLayerCommand);

    if (
      isDefined(listLayerResult.LayerVersions) &&
      listLayerResult.LayerVersions.length > 0 &&
      listLayerResult.LayerVersions?.[0].Description === `${version}` &&
      isDefined(listLayerResult.LayerVersions[0].LayerVersionArn)
    ) {
      return listLayerResult.LayerVersions[0].LayerVersionArn;
    }

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await lambdaBuildDirectoryManager.init();

    const nodeDependenciesFolder = join(
      sourceTemporaryDir,
      NODE_LAYER_SUBFOLDER,
    );

    await copyAndBuildDependencies(nodeDependenciesFolder);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: PublishLayerVersionCommandInput = {
      LayerName: COMMON_LAYER_NAME,
      Content: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      CompatibleRuntimes: [
        ServerlessFunctionRuntime.NODE18,
        ServerlessFunctionRuntime.NODE22,
      ],
      Description: `${version}`,
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

  private async build(serverlessFunction: ServerlessFunctionEntity) {
    const lambdaExecutor = await this.getLambdaExecutor(serverlessFunction);

    if (isDefined(lambdaExecutor)) {
      if (
        lambdaExecutor.Configuration?.Description ===
        LAMBDA_EXECUTOR_DESCRIPTION
      ) {
        return;
      }
      await this.delete(serverlessFunction);
    }

    const layerArn = await this.createLayerIfNotExists(
      serverlessFunction.layerVersion,
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
      FunctionName: serverlessFunction.id,
      Layers: [layerArn],
      Handler: 'index.handler',
      Role: this.options.lambdaRole,
      Runtime: serverlessFunction.runtime,
      Description: LAMBDA_EXECUTOR_DESCRIPTION,
      Timeout: serverlessFunction.timeoutSeconds,
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

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    await this.build(serverlessFunction);
    await this.waitFunctionUpdates(serverlessFunction);

    const startTime = Date.now();

    const folderPath = getServerlessFolder({
      serverlessFunction,
      version,
    });

    const tsCodeStream = await this.fileStorageService.read({
      folderPath: join(folderPath, 'src'),
      filename: INDEX_FILE_NAME,
    });

    const tsCode = await readFileContent(tsCodeStream);

    const compiledCode = transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2017,
      },
    }).outputText;

    const executorPayload = {
      params: payload,
      code: compiledCode,
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
  }
}
