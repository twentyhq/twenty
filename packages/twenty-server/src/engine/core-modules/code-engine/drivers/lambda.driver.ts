import fs from 'fs';

import {
  CreateFunctionCommand,
  Lambda,
  LambdaClientConfig,
  InvokeCommand,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';

import { createZipFile } from 'src/engine/core-modules/code-engine/utils/create-zip-file';
import { BuildDirectoryManager } from 'src/engine/core-modules/code-engine/utils/build-directory-manager';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { CommonDriver } from 'src/engine/core-modules/code-engine/drivers/common.driver';

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileStorageService: FileStorageService;
  region: string;
  role: string;
}

export class LambdaDriver extends CommonDriver implements CodeEngineDriver {
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

  async build(functionMetadata: FunctionMetadataEntity) {
    const javascriptCode = await this.getCompiledCode(
      functionMetadata,
      this.fileStorageService,
    );

    const buildDirectoryManager = new BuildDirectoryManager();

    const {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler,
    } = await buildDirectoryManager.init();

    fs.writeFileSync(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: fs.readFileSync(lambdaZipPath),
      },
      FunctionName: functionMetadata.id,
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
    functionToExecute: FunctionMetadataEntity,
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
