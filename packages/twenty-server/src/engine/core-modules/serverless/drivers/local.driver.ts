import { fork } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

import dotenv from 'dotenv';

import {
  ServerlessDriver,
  ServerlessExecuteError,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';
import { compileTypescript } from 'src/engine/core-modules/serverless/drivers/utils/compile-typescript';
import { OUTDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/outdir-folder';
import { ENV_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/env-file-name';

const LISTENER_FILE_NAME = 'listener.js';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver implements ServerlessDriver {
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
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

    try {
      await fs.access(inMemoryLastVersionLayerFolderPath);
    } catch (e) {
      await copyAndBuildDependencies(inMemoryLastVersionLayerFolderPath);
    }
  }

  async delete() {}

  async build(serverlessFunction: ServerlessFunctionEntity, version: string) {
    const computedVersion =
      version === 'latest' ? serverlessFunction.latestVersion : version;

    await this.createLayerIfNotExists(serverlessFunction.layerVersion);

    const inMemoryServerlessFunctionFolderPath =
      this.getInMemoryServerlessFunctionFolderPath(
        serverlessFunction,
        computedVersion,
      );

    const folderPath = getServerlessFolder({
      serverlessFunction,
      version,
    });

    await this.fileStorageService.download({
      from: { folderPath },
      to: { folderPath: inMemoryServerlessFunctionFolderPath },
    });

    compileTypescript(inMemoryServerlessFunctionFolderPath);

    const envFileContent = await fs.readFile(
      join(inMemoryServerlessFunctionFolderPath, ENV_FILE_NAME),
    );

    const envVariables = dotenv.parse(envFileContent);

    const listener = `
    const index_1 = require("./src/index");
    
    process.env = ${JSON.stringify(envVariables)}
    
    process.on('message', async (message) => {
      const { params } = message;
      try {
        const result = await index_1.main(params);
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

    await fs.writeFile(
      join(
        inMemoryServerlessFunctionFolderPath,
        OUTDIR_FOLDER,
        LISTENER_FILE_NAME,
      ),
      listener,
    );

    try {
      await fs.symlink(
        join(
          this.getInMemoryLayerFolderPath(serverlessFunction.layerVersion),
          'node_modules',
        ),
        join(
          inMemoryServerlessFunctionFolderPath,
          OUTDIR_FOLDER,
          'node_modules',
        ),
        'dir',
      );
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }

  async publish(serverlessFunction: ServerlessFunctionEntity) {
    const newVersion = serverlessFunction.latestVersion
      ? `${parseInt(serverlessFunction.latestVersion, 10) + 1}`
      : '1';

    const draftFolderPath = getServerlessFolder({
      serverlessFunction: serverlessFunction,
      version: 'draft',
    });
    const newFolderPath = getServerlessFolder({
      serverlessFunction: serverlessFunction,
      version: newVersion,
    });

    await this.fileStorageService.copy({
      from: { folderPath: draftFolderPath },
      to: { folderPath: newFolderPath },
    });

    await this.build(serverlessFunction, newVersion);

    return newVersion;
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    const startTime = Date.now();
    const computedVersion =
      version === 'latest' ? serverlessFunction.latestVersion : version;

    const listenerFile = join(
      this.getInMemoryServerlessFunctionFolderPath(
        serverlessFunction,
        computedVersion,
      ),
      OUTDIR_FOLDER,
      LISTENER_FILE_NAME,
    );

    try {
      return await new Promise((resolve, reject) => {
        const child = fork(listenerFile, { silent: true });

        const timeoutMs = serverlessFunction.timeoutSeconds * 1_000;

        const timeoutHandler = setTimeout(() => {
          child.kill();
          const duration = Date.now() - startTime;

          reject(new Error(`Task timed out after ${duration / 1_000} seconds`));
        }, timeoutMs);

        child.on('message', (message: object | ServerlessExecuteError) => {
          clearTimeout(timeoutHandler);
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
          clearTimeout(timeoutHandler);
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
          clearTimeout(timeoutHandler);
          reject(error);
          child.kill();
        });

        child.on('exit', (code) => {
          clearTimeout(timeoutHandler);
          if (code && code !== 0) {
            reject(new Error(`Child process exited with code ${code}`));
          }
        });

        child.send({ params: payload });
      });
    } catch (error) {
      return {
        data: null,
        duration: Date.now() - startTime,
        error: {
          errorType: 'UnhandledError',
          errorMessage: error.message || 'Unknown error',
          stackTrace: error.stack ? error.stack.split('\n') : [],
        },
        status: ServerlessFunctionExecutionStatus.ERROR,
      };
    }
  }
}
