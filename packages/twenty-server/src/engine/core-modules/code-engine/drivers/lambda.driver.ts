import fs from 'fs';

import { FileUpload } from 'graphql-upload';
import {
  CreateFunctionCommand,
  Lambda,
  LambdaClientConfig,
  InvokeCommand,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { createZipFile } from 'src/engine/core-modules/code-engine/utils/create-zip-file';
import { TemporaryLambdaFolderManager } from 'src/engine/core-modules/code-engine/utils/temporary-lambda-folder-manager';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { CommonDriver } from 'src/engine/core-modules/code-engine/drivers/common.driver';

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileUploadService: FileUploadService;
  region: string;
  role: string;
}

export class LambdaDriver extends CommonDriver implements CodeEngineDriver {
  private readonly lambdaClient: Lambda;
  private readonly lambdaRole: string;

  constructor(options: LambdaDriverOptions) {
    super(options.fileUploadService);
    const { region, role, ...lambdaOptions } = options;

    this.lambdaClient = new Lambda({ ...lambdaOptions, region });
    this.lambdaRole = role;
  }

  private _getLambdaName(name: string, workspaceId: string): string {
    return `${workspaceId}_${name}`;
  }

  async generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ) {
    const { sourceCodePath, buildSourcePath, javascriptCode } =
      await this.generateAndSaveExecutableFiles(name, workspaceId, file);

    const temporaryLambdaFolderManager = new TemporaryLambdaFolderManager();

    const {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler,
    } = await temporaryLambdaFolderManager.init();

    fs.writeFileSync(javascriptFilePath, javascriptCode);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: fs.readFileSync(lambdaZipPath),
      },
      FunctionName: this._getLambdaName(name, workspaceId),
      Handler: lambdaHandler,
      Role: this.lambdaRole,
      Runtime: 'nodejs18.x',
      Description: 'Lambda function to run user script',
      Timeout: 900,
    };

    const command = new CreateFunctionCommand(params);

    await this.lambdaClient.send(command);

    await temporaryLambdaFolderManager.clean();

    return {
      sourceCodePath,
      buildSourcePath,
    };
  }

  async execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const params = {
      FunctionName: this._getLambdaName(
        functionToExecute.name,
        functionToExecute.workspaceId,
      ),
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
