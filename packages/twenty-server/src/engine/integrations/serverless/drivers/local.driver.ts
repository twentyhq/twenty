import { fork } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { join } from 'path';

import { v4 } from 'uuid';

import { FileStorageExceptionCode } from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';
import {
  ServerlessDriver,
  ServerlessExecuteError,
  ServerlessExecuteResult,
} from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';
import { BUILD_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/build-file-name';
import { getServerlessFolder } from 'src/engine/integrations/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { COMMON_LAYER_NAME } from 'src/engine/integrations/serverless/drivers/constants/common-layer-name';
import { copyAndBuildDependencies } from 'src/engine/integrations/serverless/drivers/utils/copy-and-build-dependencies';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/integrations/serverless/drivers/constants/serverless-tmpdir-folder';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver
  extends BaseServerlessDriver
  implements ServerlessDriver
{
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    super();
    this.fileStorageService = options.fileStorageService;
  }

  private getInMemoryLayerFolderPath = (version: number) => {
    return join(SERVERLESS_TMPDIR_FOLDER, COMMON_LAYER_NAME, `${version}`);
  };

  private async createLayerIfNotExists(version: number) {
    const inMemoryLastVersionLayerFolderPath =
      this.getInMemoryLayerFolderPath(version);

    if (existsSync(inMemoryLastVersionLayerFolderPath)) {
      return;
    }

    await copyAndBuildDependencies(inMemoryLastVersionLayerFolderPath);
  }

  async delete() {}

  async build(serverlessFunction: ServerlessFunctionEntity) {
    await this.createLayerIfNotExists(serverlessFunction.layerVersion);
    const javascriptCode = await this.getCompiledCode(
      serverlessFunction,
      this.fileStorageService,
    );

    const draftFolderPath = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.write({
      file: javascriptCode,
      name: BUILD_FILE_NAME,
      mimeType: undefined,
      folder: draftFolderPath,
    });
  }

  async publish(serverlessFunction: ServerlessFunctionEntity) {
    await this.build(serverlessFunction);

    return serverlessFunction.latestVersion
      ? `${parseInt(serverlessFunction.latestVersion, 10) + 1}`
      : '1';
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    await this.createLayerIfNotExists(serverlessFunction.layerVersion);

    const startTime = Date.now();
    let fileContent = '';

    try {
      const fileStream = await this.fileStorageService.read({
        folderPath: getServerlessFolder({
          serverlessFunction,
          version,
        }),
        filename: BUILD_FILE_NAME,
      });

      fileContent = await readFileContent(fileStream);
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        throw new ServerlessFunctionException(
          `Function Version '${version}' does not exist`,
          ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }
      throw error;
    }

    const tmpFolderPath = join(SERVERLESS_TMPDIR_FOLDER, v4());

    const tmpFilePath = join(tmpFolderPath, 'index.js');

    await fs.symlink(
      this.getInMemoryLayerFolderPath(serverlessFunction.layerVersion),
      tmpFolderPath,
      'dir',
    );

    const modifiedContent = `
    process.on('message', async (message) => {
      const { event, context } = message;
      try {
        const result = await handler(event, context);
        process.send(result);
      } catch (error) {
        process.send({
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack.split('\\n').filter((line) => line.trim() !== ''),
        });
      }
    });

    ${fileContent}
    `;

    await fs.writeFile(tmpFilePath, modifiedContent);

    return await new Promise((resolve, reject) => {
      const child = fork(tmpFilePath, { silent: true });

      child.on('message', (message: object | ServerlessExecuteError) => {
        const duration = Date.now() - startTime;

        if ('errorType' in message) {
          resolve({
            data: null,
            duration,
            error: message,
            status: ServerlessFunctionExecutionStatus.ERROR,
          });
        } else {
          resolve({
            data: message,
            duration,
            status: ServerlessFunctionExecutionStatus.SUCCESS,
          });
        }
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.stderr?.on('data', (data) => {
        const stackTrace = data
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');
        const errorTrace = stackTrace.filter((line: string) =>
          line.includes('Error: '),
        )?.[0];

        let errorType = 'Unknown';
        let errorMessage = '';

        if (errorTrace) {
          errorType = errorTrace.split(':')[0];
          errorMessage = errorTrace.split(': ')[1];
        }
        const duration = Date.now() - startTime;

        resolve({
          data: null,
          duration,
          status: ServerlessFunctionExecutionStatus.ERROR,
          error: {
            errorType,
            errorMessage,
            stackTrace: stackTrace,
          },
        });
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.on('error', (error) => {
        reject(error);
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
          fs.unlink(tmpFilePath).catch(console.error);
        }
      });

      child.send({ event: payload });
    });
  }
}
