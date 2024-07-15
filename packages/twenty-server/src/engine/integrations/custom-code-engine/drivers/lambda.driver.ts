import fs from 'fs';
import { join } from 'path';

import { FileUpload } from 'graphql-upload';
import {
  CreateFunctionCommand,
  Lambda,
  LambdaClientConfig,
  InvokeCommand,
} from '@aws-sdk/client-lambda';
import { CreateFunctionCommandInput } from '@aws-sdk/client-lambda/dist-types/commands/CreateFunctionCommand';

import { CustomCodeEngineDriver } from 'src/engine/integrations/custom-code-engine/drivers/interfaces/custom-code-engine-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/integrations/custom-code-engine/utils/compile-typescript';
import { createZipFile } from 'src/engine/integrations/custom-code-engine/utils/create-zip-file';
import { TemporaryLambdaFolderManager } from 'src/engine/integrations/custom-code-engine/utils/temporary-lambda-folder-manager';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

export interface LambdaDriverOptions extends LambdaClientConfig {
  fileUploadService: FileUploadService;
  region: string;
  role: string;
}

export class LambdaDriver implements CustomCodeEngineDriver {
  private readonly lambdaClient: Lambda;
  private readonly lambdaRole: string;
  private readonly fileUploadService: FileUploadService;

  constructor(options: LambdaDriverOptions) {
    const { region, role, ...lambdaOptions } = options;

    this.lambdaClient = new Lambda({ ...lambdaOptions, region });
    this.lambdaRole = role;
    this.fileUploadService = options.fileUploadService;
  }

  private _getLambdaName(name: string, workspaceId: string): string {
    return `${workspaceId}_${name}`;
  }

  async generateExecutable(
    name: string,
    workspaceId: string,
    { createReadStream, mimetype }: FileUpload,
  ) {
    const typescriptCode = await readFileContent(createReadStream());
    const javascriptCode = compileTypescript(typescriptCode);
    const fileFolder = join(FileFolder.Function, workspaceId);

    const { path: sourceCodePath } = await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename: `${name}.ts`,
      mimeType: mimetype,
      fileFolder,
    });

    const { path: buildSourcePath } = await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: `${name}.js`,
      mimeType: mimetype,
      fileFolder,
    });

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
