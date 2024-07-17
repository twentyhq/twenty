import fs from 'fs';

import {
  CreateFunctionCommand,
  Lambda,
  LambdaClientConfig,
  InvokeCommand,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';

import { ServerlessDriver } from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { createZipFile } from 'src/engine/integrations/serverless/drivers/utils/create-zip-file';
import { BuildDirectoryManager } from 'src/engine/integrations/serverless/drivers/utils/build-directory-manager';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';

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

    await fs.promises.writeFile(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: await fs.promises.readFile(lambdaZipPath),
      },
      FunctionName: serverlessFunction.id,
      Handler: lambdaHandler,
      Role: this.lambdaRole,
      Runtime: 'nodejs18.x',
      Description: 'Lambda function to run user script',
      Timeout: 900,
    };

    const command = new CreateFunctionCommand(params);

    await this.lambdaClient.send(command);

    await buildDirectoryManager.clean();
  }

  async execute(
    functionToExecute: ServerlessFunctionEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const params = {
      FunctionName: functionToExecute.id,
      Payload: JSON.stringify(payload),
    };

    const command = new InvokeCommand(params);

    const result = await this.lambdaClient.send(command);

    if (!result.Payload) {
      return {};
    }

    return JSON.parse(result.Payload.transformToString());
  }
}
