import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
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
} from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { createZipFile } from 'src/engine/integrations/serverless/drivers/utils/create-zip-file';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';
import { BuildDirectoryManager } from 'src/engine/integrations/serverless/drivers/utils/build-directory-manager';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { isDefined } from 'src/utils/is-defined';
import { PACKAGE_JSON } from 'src/engine/integrations/serverless/drivers/constants/dependencies/package_json';
import { YARN_LOCK } from 'src/engine/integrations/serverless/drivers/constants/dependencies/yarn_lock';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

const execPromise = promisify(exec);

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

  private async getLastCommonLayer() {
    const params: ListLayerVersionsCommandInput = {
      LayerName: 'common-layer',
      MaxItems: 1,
    };
    const command = new ListLayerVersionsCommand(params);

    const result = await this.lambdaClient.send(command);

    if (!isDefined(result.LayerVersions) || result.LayerVersions.length === 0) {
      return;
    }

    return result.LayerVersions[0];
  }

  private async upsertCommonLayer(): Promise<string> {
    const dependencyHash = serverlessFunctionCreateHash(
      PACKAGE_JSON + YARN_LOCK,
    );
    const lastCommonLayer = await this.getLastCommonLayer();

    if (
      dependencyHash === lastCommonLayer?.Description &&
      lastCommonLayer.LayerVersionArn
    ) {
      return lastCommonLayer.LayerVersionArn;
    }
    const buildDirectoryManager = new BuildDirectoryManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await buildDirectoryManager.init();

    const nodeDependenciesFolder = join(sourceTemporaryDir, 'nodejs');

    await fs.mkdir(nodeDependenciesFolder);

    await fs.writeFile(
      join(nodeDependenciesFolder, 'package.json'),
      PACKAGE_JSON,
    );
    await fs.writeFile(join(nodeDependenciesFolder, 'yarn.lock'), YARN_LOCK);

    await execPromise('yarn', {
      cwd: nodeDependenciesFolder,
    });

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: PublishLayerVersionCommandInput = {
      LayerName: 'common-layer',
      Content: {
        ZipFile: await fs.readFile(lambdaZipPath),
      },
      CompatibleRuntimes: [ServerlessFunctionRuntime.NODE18],
      Description: dependencyHash,
    };

    const command = new PublishLayerVersionCommand(params);

    const result = await this.lambdaClient.send(command);

    await buildDirectoryManager.clean();

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('new layer version arn undefined');
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

    const buildDirectoryManager = new BuildDirectoryManager();

    const {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler,
    } = await buildDirectoryManager.init();

    await fs.writeFile(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const functionExists = await this.checkFunctionExists(
      serverlessFunction.id,
    );

    if (!functionExists) {
      const layerArn = await this.upsertCommonLayer();

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

    const waitParams = { FunctionName: serverlessFunction.id };

    await waitUntilFunctionUpdatedV2(
      { client: this.lambdaClient, maxWaitTime: 30 },
      waitParams,
    );

    await buildDirectoryManager.clean();
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
