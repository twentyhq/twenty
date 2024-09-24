import * as fs from 'fs/promises';
import { join } from 'path';

import {
  CreateFunctionCommand,
  DeleteFunctionCommand,
  GetFunctionCommand,
  InvokeCommand,
  InvokeCommandInput,
  Lambda,
  LambdaClientConfig,
  PublishLayerVersionCommand,
  PublishLayerVersionCommandInput,
  PublishVersionCommand,
  PublishVersionCommandInput,
  ResourceNotFoundException,
  UpdateFunctionCodeCommand,
  waitUntilFunctionUpdatedV2,
  ListLayerVersionsCommandInput,
  ListLayerVersionsCommand,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';
import { UpdateFunctionCodeCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/UpdateFunctionCodeCommand';

import {
  ServerlessDriver,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import {
  ServerlessFunctionEntity,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  LambdaBuildDirectoryManager,
  NODE_LAYER_SUBFOLDER,
} from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { BaseServerlessDriver } from 'src/engine/core-modules/serverless/drivers/base-serverless.driver';
import { createZipFile } from 'src/engine/core-modules/serverless/drivers/utils/create-zip-file';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { isDefined } from 'src/utils/is-defined';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileStorageService: FileStorageService;
  region: string;
  role: string;
}

export class LambdaDriver
  extends BaseServerlessDriver
  implements ServerlessDriver
{
  private readonly lambdaClient: Lambda;
  private readonly lambdaRole: string;
  private readonly fileStorageService: FileStorageService;

  constructor(options: LambdaDriverOptions) {
    super();
    const { region, role, ...lambdaOptions } = options;

    this.lambdaClient = new Lambda({ ...lambdaOptions, region });
    this.lambdaRole = role;
    this.fileStorageService = options.fileStorageService;
  }

  private async waitFunctionUpdates(
    serverlessFunctionId: string,
    maxWaitTime: number,
  ) {
    const waitParams = { FunctionName: serverlessFunctionId };

    await waitUntilFunctionUpdatedV2(
      { client: this.lambdaClient, maxWaitTime },
      waitParams,
    );
  }

  private async createLayerIfNotExists(version: number): Promise<string> {
    const listLayerParams: ListLayerVersionsCommandInput = {
      LayerName: COMMON_LAYER_NAME,
      MaxItems: 1,
    };
    const listLayerCommand = new ListLayerVersionsCommand(listLayerParams);
    const listLayerResult = await this.lambdaClient.send(listLayerCommand);

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
      CompatibleRuntimes: [ServerlessFunctionRuntime.NODE18],
      Description: `${version}`,
    };

    const command = new PublishLayerVersionCommand(params);

    const result = await this.lambdaClient.send(command);

    await lambdaBuildDirectoryManager.clean();

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('new layer version arn si undefined');
    }

    return result.LayerVersionArn;
  }

  private async checkFunctionExists(functionName: string): Promise<boolean> {
    try {
      const getFunctionCommand = new GetFunctionCommand({
        FunctionName: functionName,
      });

      await this.lambdaClient.send(getFunctionCommand);

      return true;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return false;
      }
      throw error;
    }
  }

  async delete(serverlessFunction: ServerlessFunctionEntity) {
    const functionExists = await this.checkFunctionExists(
      serverlessFunction.id,
    );

    if (functionExists) {
      const deleteFunctionCommand = new DeleteFunctionCommand({
        FunctionName: serverlessFunction.id,
      });

      await this.lambdaClient.send(deleteFunctionCommand);
    }
  }

  async build(serverlessFunction: ServerlessFunctionEntity) {
    const javascriptCode = await this.getCompiledCode(
      serverlessFunction,
      this.fileStorageService,
    );

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    const {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler,
    } = await lambdaBuildDirectoryManager.init();

    await fs.writeFile(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const functionExists = await this.checkFunctionExists(
      serverlessFunction.id,
    );

    if (!functionExists) {
      const layerArn = await this.createLayerIfNotExists(
        serverlessFunction.layerVersion,
      );

      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: serverlessFunction.id,
        Handler: lambdaHandler,
        Layers: [layerArn],
        Role: this.lambdaRole,
        Runtime: serverlessFunction.runtime,
        Description: 'Lambda function to run user script',
        Timeout: 900,
      };

      const command = new CreateFunctionCommand(params);

      await this.lambdaClient.send(command);
    } else {
      const params: UpdateFunctionCodeCommandInput = {
        ZipFile: await fs.readFile(lambdaZipPath),
        FunctionName: serverlessFunction.id,
      };

      const command = new UpdateFunctionCodeCommand(params);

      await this.lambdaClient.send(command);
    }

    await this.waitFunctionUpdates(serverlessFunction.id, 10);

    await lambdaBuildDirectoryManager.clean();
  }

  async publish(serverlessFunction: ServerlessFunctionEntity) {
    await this.build(serverlessFunction);
    const params: PublishVersionCommandInput = {
      FunctionName: serverlessFunction.id,
    };

    const command = new PublishVersionCommand(params);

    const result = await this.lambdaClient.send(command);
    const newVersion = result.Version;

    if (!newVersion) {
      throw new Error('New published version is undefined');
    }

    return newVersion;
  }

  async execute(
    functionToExecute: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    const computedVersion =
      version === 'latest' ? functionToExecute.latestVersion : version;

    const functionName =
      computedVersion === 'draft'
        ? functionToExecute.id
        : `${functionToExecute.id}:${computedVersion}`;

    await this.waitFunctionUpdates(functionToExecute.id, 10);

    const startTime = Date.now();
    const params: InvokeCommandInput = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    };

    const command = new InvokeCommand(params);

    try {
      const result = await this.lambdaClient.send(command);

      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const duration = Date.now() - startTime;

      if (result.FunctionError) {
        return {
          data: null,
          duration,
          status: ServerlessFunctionExecutionStatus.ERROR,
          error: parsedResult,
        };
      }

      return {
        data: parsedResult,
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
