/* eslint-disable no-console */
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { fork } from 'child_process';

import { v4 } from 'uuid';

import {
  ServerlessDriver,
  ServerlessExecuteError,
  ServerlessExecuteResult,
} from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';
import { FileStorageExceptionCode } from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { BUILD_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/build-file-name';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { getServerlessFolder } from 'src/engine/integrations/serverless/utils/serverless-get-folder.utils';

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

  async delete() {}

  async build(serverlessFunction: ServerlessFunctionEntity) {
    const javascriptCode = await this.getCompiledCode(
      serverlessFunction,
      this.fileStorageService,
    );

    await this.fileStorageService.write({
      file: javascriptCode,
      name: BUILD_FILE_NAME,
      mimeType: undefined,
      folder: getServerlessFolder({
        serverlessFunction,
        version: 'draft',
      }),
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
    payload: object | undefined = undefined,
    version: string,
  ): Promise<ServerlessExecuteResult> {
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

    const tmpFilePath = join(tmpdir(), `${v4()}.js`);

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
