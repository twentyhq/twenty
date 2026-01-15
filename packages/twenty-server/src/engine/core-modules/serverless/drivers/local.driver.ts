import { promises as fs } from 'fs';
import { join } from 'path';

import ivm from 'isolated-vm';

import {
  type ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';
import { buildServerlessFunctionForIsolate } from 'src/engine/core-modules/serverless/drivers/utils/build-serverless-function-for-isolate';
import { copyAndBuildDependencies } from 'src/engine/core-modules/serverless/drivers/utils/copy-and-build-dependencies';
import { formatBuildError } from 'src/engine/core-modules/serverless/drivers/utils/format-build-error';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

// Hardcoded security limits - not configurable by design
const MEMORY_LIMIT_MB = 128;
const EXECUTION_TIMEOUT_MS = 30_000;

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
    return join(
      SERVERLESS_TMPDIR_FOLDER,
      serverlessFunction.serverlessFunctionLayer.checksum,
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

  async execute({
    serverlessFunction,
    payload,
    version,
    env,
  }: {
    serverlessFunction: ServerlessFunctionEntity;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult> {
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
        builtBundleFilePath = await buildServerlessFunctionForIsolate({
          sourceTemporaryDir,
          handlerPath: serverlessFunction.handlerPath,
        });
      } catch (error) {
        return formatBuildError(error, startTime);
      }

      // Read the compiled code
      const compiledCode = await fs.readFile(builtBundleFilePath, 'utf-8');

      // Execute in isolated-vm
      const result = await this.executeInIsolate({
        code: compiledCode,
        handlerName: serverlessFunction.handlerName,
        payload,
        env: env ?? {},
      });

      const duration = Date.now() - startTime;

      if (result.success) {
        return {
          data: result.data,
          logs: result.logs,
          duration,
          status: ServerlessFunctionExecutionStatus.SUCCESS,
        };
      }

      return {
        data: null,
        logs: result.logs,
        duration,
        error: {
          errorType: result.errorType || 'UnhandledError',
          errorMessage: result.errorMessage || 'Unknown error',
          stackTrace: result.stackTrace || [],
        },
        status: ServerlessFunctionExecutionStatus.ERROR,
      };
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }

  private async executeInIsolate({
    code,
    handlerName,
    payload,
    env,
  }: {
    code: string;
    handlerName: string;
    payload: object;
    env: Record<string, string>;
  }): Promise<{
    success: boolean;
    data: object | null;
    logs: string;
    errorType?: string;
    errorMessage?: string;
    stackTrace?: string[];
  }> {
    const logs: string[] = [];

    // Create a new isolate with memory limit
    const isolate = new ivm.Isolate({ memoryLimit: MEMORY_LIMIT_MB });

    try {
      // Create a new context within the isolate
      const context = await isolate.createContext();

      // Get a reference to the global object within the context
      const jail = context.global;

      // Set up a minimal, safe global environment
      await jail.set('global', jail.derefInto());

      // Create a safe console.log that captures output
      const logCallback = (level: string) => {
        return (...args: unknown[]) => {
          const formattedArgs = args.map((arg) => {
            if (typeof arg === 'object' && arg !== null) {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }

            return String(arg);
          });

          logs.push(
            `${new Date().toISOString()} ${level.toUpperCase()} ${formattedArgs.join(' ')}`,
          );
        };
      };

      // Set up console object with safe callbacks
      await jail.set('_logInfo', new ivm.Callback(logCallback('info')), {});
      await jail.set('_logWarn', new ivm.Callback(logCallback('warn')), {});
      await jail.set('_logError', new ivm.Callback(logCallback('error')), {});
      await jail.set('_logDebug', new ivm.Callback(logCallback('debug')), {});

      // Set up console shim
      await context.eval(`
        const console = {
          log: (...args) => _logInfo(...args),
          info: (...args) => _logInfo(...args),
          warn: (...args) => _logWarn(...args),
          error: (...args) => _logError(...args),
          debug: (...args) => _logDebug(...args),
        };
        Object.freeze(console);
      `);

      // Inject environment variables as a frozen object
      await jail.set('_env', new ivm.ExternalCopy(env).copyInto());
      await context.eval(`
        const process = { env: Object.freeze(_env) };
        Object.freeze(process);
        delete _env;
      `);

      // Inject payload
      await jail.set('_payload', new ivm.ExternalCopy(payload).copyInto());

      // Compile and run the user code
      // The code is built as IIFE with globalName '__serverlessExports'
      // so exports are available at __serverlessExports.handlerName
      const script = await isolate.compileScript(`
        ${code}

        // The bundled IIFE code sets up __serverlessExports
        if (typeof __serverlessExports === 'undefined' || typeof __serverlessExports.${handlerName} !== 'function') {
          throw new Error('Handler function "${handlerName}" not found in module exports');
        }

        // Execute the handler and store the result
        (async () => {
          try {
            const result = await __serverlessExports.${handlerName}(_payload);
            return JSON.stringify({ success: true, data: result });
          } catch (err) {
            return JSON.stringify({
              success: false,
              errorType: err.name || 'Error',
              errorMessage: err.message || String(err),
              stackTrace: err.stack ? err.stack.split('\\n') : []
            });
          }
        })();
      `);

      // Run with timeout
      const resultJson = await script.run(context, {
        timeout: EXECUTION_TIMEOUT_MS,
        promise: true,
      });

      const result = JSON.parse(resultJson as string);

      return {
        success: result.success,
        data: result.data ?? null,
        logs: logs.join('\n') + (logs.length > 0 ? '\n' : ''),
        errorType: result.errorType,
        errorMessage: result.errorMessage,
        stackTrace: result.stackTrace,
      };
    } catch (error) {
      // Handle isolate-level errors (timeout, memory, etc.)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isTimeout = errorMessage.includes('Script execution timed out');
      const isMemory =
        errorMessage.includes('Isolate was disposed') ||
        errorMessage.includes('memory');

      return {
        success: false,
        data: null,
        logs: logs.join('\n') + (logs.length > 0 ? '\n' : ''),
        errorType: isTimeout
          ? 'TimeoutError'
          : isMemory
            ? 'MemoryError'
            : 'IsolateError',
        errorMessage: isTimeout
          ? `Execution timed out after ${EXECUTION_TIMEOUT_MS}ms`
          : isMemory
            ? `Memory limit exceeded (${MEMORY_LIMIT_MB}MB)`
            : errorMessage,
        stackTrace:
          error instanceof Error && error.stack ? error.stack.split('\n') : [],
      };
    } finally {
      // Always dispose the isolate to free resources
      if (!isolate.isDisposed) {
        isolate.dispose();
      }
    }
  }
}
