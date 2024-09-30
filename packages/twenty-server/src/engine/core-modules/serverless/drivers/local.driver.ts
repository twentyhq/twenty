import { fork } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { join } from 'path';

import {
  ServerlessDriver,
  ServerlessExecuteError,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { BaseServerlessDriver } from 'src/engine/core-modules/serverless/drivers/base-serverless.driver';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';
import { compileTypescript2 } from 'src/engine/core-modules/serverless/drivers/utils/compile-typescript';

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

  private getInMemoryServerlessFunctionFolderPath = (
    serverlessFunction: ServerlessFunctionEntity,
    version: string,
  ) => {
    return join(SERVERLESS_TMPDIR_FOLDER, serverlessFunction.id, version);
  };

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

  async build(serverlessFunction: ServerlessFunctionEntity, version: string) {
    await this.createLayerIfNotExists(serverlessFunction.layerVersion);
    const inMemoryServerlessFunctionFolderPath =
      this.getInMemoryServerlessFunctionFolderPath(serverlessFunction, version);

    const draftFolderPath = getServerlessFolder({
      serverlessFunction,
      version,
    });

    await this.fileStorageService.download({
      from: { folderPath: draftFolderPath },
      to: { folderPath: inMemoryServerlessFunctionFolderPath },
    });

    compileTypescript2(inMemoryServerlessFunctionFolderPath);
  }

  async publish(serverlessFunction: ServerlessFunctionEntity) {
    await this.build(serverlessFunction, 'draft');

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

    const listener = `
    const index_1 = require("./src/index");
    process.on('message', async (message) => {
      const { event, context } = message;
      try {
        const result = await index_1.handler(event, context);
        process.send(result);
      } catch (error) {
        process.send({
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack.split('\\n').filter((line) => line.trim() !== ''),
        });
      }
    });
    `;

    const inMemoryServerlessFunctionFolderPath =
      this.getInMemoryServerlessFunctionFolderPath(serverlessFunction, version);

    try {
      await fs.writeFile(
        join(inMemoryServerlessFunctionFolderPath, 'dist', 'listener.js'),
        listener,
      );
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    try {
      await fs.symlink(
        this.getInMemoryLayerFolderPath(serverlessFunction.layerVersion),
        inMemoryServerlessFunctionFolderPath,
        'dir',
      );
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    const listenerFile = join(
      this.getInMemoryServerlessFunctionFolderPath(serverlessFunction, version),
      'dist',
      'listener.js',
    );

    return await new Promise((resolve, reject) => {
      const child = fork(listenerFile, { silent: true });

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
      });

      child.on('error', (error) => {
        reject(error);
        child.kill();
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });

      child.send({ event: payload });
    });
  }
}
