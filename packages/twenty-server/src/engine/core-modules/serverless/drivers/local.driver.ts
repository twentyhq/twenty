import { promises as fs } from 'fs';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import {
  type ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { ConsoleListener } from 'src/engine/core-modules/serverless/drivers/utils/intercept-console';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { buildServerlessFunctionInMemory } from 'src/engine/core-modules/serverless/drivers/utils/build-serverless-function-in-memory';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver implements ServerlessDriver {
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    this.fileStorageService = options.fileStorageService;
  }

  private getInMemoryLayerFolderPath = (
    serverlessFunction: ServerlessFunctionEntity,
  ) => {
    if (!isDefined(serverlessFunction?.serverlessFunctionLayer?.checksum)) {
      return join(
        SERVERLESS_TMPDIR_FOLDER,
        COMMON_LAYER_NAME,
        `${serverlessFunction.layerVersion}`,
      );
    }

    return join(
      SERVERLESS_TMPDIR_FOLDER,
      serverlessFunction.serverlessFunctionLayer?.checksum,
    );
  };

  private async createLayerIfNotExists(
    serverlessFunction: ServerlessFunctionEntity,
  ) {
    const inMemoryLayerFolderPath =
      this.getInMemoryLayerFolderPath(serverlessFunction);

    try {
      await fs.access(inMemoryLayerFolderPath);
    } catch {
      await copyAndBuildDependencies(
        inMemoryLayerFolderPath,
        serverlessFunction,
      );
    }
  }

  async delete() {}

  private async build(serverlessFunction: ServerlessFunctionEntity) {
    await this.createLayerIfNotExists(serverlessFunction);
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timed out after ${timeoutMs / 1_000} seconds`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    await this.build(serverlessFunction);

    const startTime = Date.now();

    const folderPath = getServerlessFolder({
      serverlessFunction,
      version,
    });

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.fileStorageService.download({
        from: { folderPath },
        to: { folderPath: sourceTemporaryDir },
      });

      let builtBundleFilePath = '';

      try {
        builtBundleFilePath =
          await buildServerlessFunctionInMemory(sourceTemporaryDir);
      } catch (error) {
        return {
          data: null,
          logs: '',
          duration: Date.now() - startTime,
          error: {
            errorType: 'BuildError',
            errorMessage:
              // @ts-expect-error legacy noImplicitAny
              error.errors.map((e) => e.text).join('\n') || 'Unknown error',
            stackTrace: error.stack ? error.stack.split('\n') : [],
          },
          status: ServerlessFunctionExecutionStatus.ERROR,
        };
      }

      try {
        await fs.symlink(
          join(
            this.getInMemoryLayerFolderPath(serverlessFunction),
            'node_modules',
          ),
          join(sourceTemporaryDir, 'node_modules'),
          'dir',
        );
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }

      let logs = '';

      const consoleListener = new ConsoleListener();

      consoleListener.intercept((type, args) => {
        const formattedArgs = args.map((arg) => {
          if (typeof arg === 'object' && arg !== null) {
            const seen = new WeakSet();

            return JSON.stringify(
              arg,
              (_key, value) => {
                if (typeof value === 'object' && value !== null) {
                  if (seen.has(value)) {
                    return '[Circular]'; // Handle circular references
                  }
                  seen.add(value);
                }

                return value;
              },
              2,
            );
          }

          return arg;
        });

        const formattedType = type === 'log' ? 'info' : type;

        logs += `${new Date().toISOString()} ${formattedType.toUpperCase()} ${formattedArgs.join(' ')}\n`;
      });

      try {
        const mainFile = await import(builtBundleFilePath);

        const result = await this.executeWithTimeout<object | null>(
          () => mainFile.main(payload),
          serverlessFunction.timeoutSeconds * 1_000,
        );

        const duration = Date.now() - startTime;

        return {
          data: result,
          logs,
          duration,
          status: ServerlessFunctionExecutionStatus.SUCCESS,
        };
      } catch (error) {
        return {
          data: null,
          logs,
          duration: Date.now() - startTime,
          error: {
            errorType: 'UnhandledError',
            errorMessage: error.message || 'Unknown error',
            stackTrace: error.stack ? error.stack.split('\n') : [],
          },
          status: ServerlessFunctionExecutionStatus.ERROR,
        };
      } finally {
        // Restoring originalConsole
        consoleListener.release();
      }
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }
}
