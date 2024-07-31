import fs from 'fs';

import {
  CreateFunctionCommand,
  Lambda,
  LambdaClientConfig,
  InvokeCommand,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
  DeleteFunctionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';
import { UpdateFunctionCodeCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/UpdateFunctionCodeCommand';

import {
  ServerlessDriver,
  ServerlessExecuteResult,
} from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { createZipFile } from 'src/engine/integrations/serverless/drivers/utils/create-zip-file';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';
import { BuildDirectoryManagerService } from 'src/engine/integrations/serverless/drivers/services/build-directory-manager.service';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileStorageService: FileStorageService;
  buildDirectoryManagerService: BuildDirectoryManagerService;
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
  private readonly buildDirectoryManagerService: BuildDirectoryManagerService;

  constructor(options: LambdaDriverOptions) {
    super();
    const { region, role, ...lambdaOptions } = options;

    this.lambdaClient = new Lambda({ ...lambdaOptions, region });
    this.lambdaRole = role;
    this.fileStorageService = options.fileStorageService;
    this.buildDirectoryManagerService = options.buildDirectoryManagerService;
  }

  private async checkFunctionExists(
    serverlessFunctionId: string,
  ): Promise<boolean> {
    try {
      const getFunctionCommand = new GetFunctionCommand({
        FunctionName: serverlessFunctionId,
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

    const {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler,
    } = await this.buildDirectoryManagerService.init();

    await fs.promises.writeFile(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const functionExists = await this.checkFunctionExists(
      serverlessFunction.id,
    );

    if (!functionExists) {
      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.promises.readFile(lambdaZipPath),
        },
        FunctionName: serverlessFunction.id,
        Handler: lambdaHandler,
        Role: this.lambdaRole,
        Runtime: serverlessFunction.runtime,
        Description: 'Lambda function to run user script',
        Timeout: 900,
      };

      const command = new CreateFunctionCommand(params);

      await this.lambdaClient.send(command);
    } else {
      const params: UpdateFunctionCodeCommandInput = {
        ZipFile: await fs.promises.readFile(lambdaZipPath),
        FunctionName: serverlessFunction.id,
      };

      const command = new UpdateFunctionCodeCommand(params);

      await this.lambdaClient.send(command);
    }

    await this.buildDirectoryManagerService.clean();
  }

  async execute(
    functionToExecute: ServerlessFunctionEntity,
    payload: object | undefined = undefined,
  ): Promise<ServerlessExecuteResult> {
    const startTime = Date.now();
    const params = {
      FunctionName: functionToExecute.id,
      Payload: JSON.stringify(payload),
    };

    const command = new InvokeCommand(params);

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
  }
}
