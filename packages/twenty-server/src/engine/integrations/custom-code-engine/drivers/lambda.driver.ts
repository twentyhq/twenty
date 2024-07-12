import fs from 'fs';

import { FileUpload } from 'graphql-upload';
import { v4 } from 'uuid';
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
import { FunctionWorkspaceEntity } from 'src/modules/function/standard-objects/function.workspace-entity';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/integrations/custom-code-engine/utils/compile-typescript';
import { createZipFile } from 'src/engine/integrations/custom-code-engine/utils/create-zip-file';
import { TemporaryLambdaFolderManager } from 'src/engine/integrations/custom-code-engine/utils/temporary-lambda-folder-manager';

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

  async upsert(file: FileUpload) {
    const { createReadStream, filename, mimetype } = file;
    const typescriptCode = await readFileContent(createReadStream());
    const javascriptCode = compileTypescript(typescriptCode);

    const { path: sourceCodePath } = await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename,
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
    });

    const { path: builtSourcePath } = await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: '.js',
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
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

    const lambdaName = v4();

    const params: CreateFunctionCommandInput = {
      Code: {
        ZipFile: fs.readFileSync(lambdaZipPath),
      },
      FunctionName: lambdaName,
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
      builtSourcePath,
      lambdaName,
    };
  }

  async execute(
    functionToExecute: FunctionWorkspaceEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const params = {
      FunctionName: functionToExecute.lambdaName,
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
