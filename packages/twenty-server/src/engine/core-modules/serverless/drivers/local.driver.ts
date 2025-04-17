import { promises as fs } from 'fs';
import { join } from 'path';

import ts, { transpileModule } from 'typescript';
import { v4 } from 'uuid';

import {
  ServerlessDriver,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { COMMON_LAYER_NAME } from 'src/engine/core-modules/serverless/drivers/constants/common-layer-name';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { readFileContent } from 'src/engine/core-modules/file-storage/utils/read-file-content';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ConsoleListener } from 'src/engine/core-modules/serverless/drivers/utils/intercept-console';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver implements ServerlessDriver {
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    this.fileStorageService = options.fileStorageService;
  }

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

  private async build(serverlessFunction: ServerlessFunctionEntity) {
    await this.createLayerIfNotExists(serverlessFunction.layerVersion);
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

    const tsCodeStream = await this.fileStorageService.read({
      folderPath: join(folderPath, 'src'),
      filename: INDEX_FILE_NAME,
    });

    const tsCode = await readFileContent(tsCodeStream);

    const compiledCode = transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
      },
    }).outputText;

    const compiledCodeFolderPath = join(
      SERVERLESS_TMPDIR_FOLDER,
      `compiled-code-${v4()}`,
    );

    const compiledCodeFilePath = join(compiledCodeFolderPath, 'main.js');

    await fs.mkdir(compiledCodeFolderPath, { recursive: true });

    await fs.writeFile(compiledCodeFilePath, compiledCode, 'utf8');

    try {
      await fs.symlink(
        join(
          this.getInMemoryLayerFolderPath(serverlessFunction.layerVersion),
          'node_modules',
        ),
        join(compiledCodeFolderPath, 'node_modules'),
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
            (key, value) => {
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
      const mainFile = await import(compiledCodeFilePath);

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
      await fs.rm(compiledCodeFolderPath, { recursive: true, force: true });
    }
  }
}
