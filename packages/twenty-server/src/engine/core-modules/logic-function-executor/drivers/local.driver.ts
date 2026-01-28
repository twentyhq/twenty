import { promises as fs } from 'fs';
import { spawn } from 'node:child_process';
import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';

import {
  type LogicFunctionExecutorDriver,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function-executor/drivers/interfaces/logic-function-executor-driver.interface';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function-executor/drivers/constants/logic-function-executor-tmpdir-folder';
import { copyAndBuildDependencies } from 'src/engine/core-modules/logic-function-executor/drivers/utils/copy-and-build-dependencies';
import { ConsoleListener } from 'src/engine/core-modules/logic-function-executor/drivers/utils/intercept-console';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function-executor/drivers/utils/lambda-build-directory-manager';
import { getLogicFunctionFolderOrThrow } from 'src/engine/core-modules/logic-function-executor/utils/get-logic-function-folder-or-throw.utils';
import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver implements LogicFunctionExecutorDriver {
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    this.fileStorageService = options.fileStorageService;
  }

  private getInMemoryLayerFolderPath = (
    flatLogicFunctionLayer: FlatLogicFunctionLayer,
  ) => {
    return join(
      LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER,
      flatLogicFunctionLayer.checksum,
    );
  };

  private async createLayerIfNotExists(
    flatLogicFunctionLayer: FlatLogicFunctionLayer,
  ) {
    const inMemoryLayerFolderPath = this.getInMemoryLayerFolderPath(
      flatLogicFunctionLayer,
    );

    try {
      await fs.access(inMemoryLayerFolderPath);
    } catch {
      await copyAndBuildDependencies(
        inMemoryLayerFolderPath,
        flatLogicFunctionLayer,
      );
    }
  }

  async delete() {}

  private async build(flatLogicFunctionLayer: FlatLogicFunctionLayer) {
    await this.createLayerIfNotExists(flatLogicFunctionLayer);
  }

  async execute({
    flatLogicFunction,
    flatLogicFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatLogicFunctionLayer: FlatLogicFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<LogicFunctionExecuteResult> {
    await this.build(flatLogicFunctionLayer);

    const startTime = Date.now();

    const builtHandlerFolderPath = getLogicFunctionFolderOrThrow({
      flatLogicFunction,
      version,
      fileFolder: FileFolder.BuiltFunction,
    });

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.fileStorageService.download({
        from: {
          folderPath: builtHandlerFolderPath,
          filename: flatLogicFunction.builtHandlerPath,
        },
        to: {
          folderPath: sourceTemporaryDir,
          filename: flatLogicFunction.builtHandlerPath,
        },
      });

      try {
        await fs.symlink(
          join(
            this.getInMemoryLayerFolderPath(flatLogicFunctionLayer),
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
        const builtBundleFilePath = join(
          sourceTemporaryDir,
          flatLogicFunction.builtHandlerPath,
        );

        const runnerPath = await this.writeBootstrapRunner({
          dir: sourceTemporaryDir,
          builtFileAbsPath: builtBundleFilePath,
          handlerName: flatLogicFunction.handlerName,
        });

        const { ok, result, error, stack, stdout, stderr } =
          await this.runChildWithEnv({
            runnerPath,
            env: env ?? {},
            payload,
            timeoutMs: 900_000, // timeout is handled by the logic function service
          });

        if (stdout)
          logs +=
            stdout
              .split('\n')
              .filter(Boolean)
              .map((l) => `${new Date().toISOString()} INFO ${l}`)
              .join('\n') + '\n';
        if (stderr)
          logs +=
            stderr
              .split('\n')
              .filter(Boolean)
              .map((l) => `${new Date().toISOString()} ERROR ${l}`)
              .join('\n') + '\n';

        const duration = Date.now() - startTime;

        if (ok) {
          return {
            data: (result ?? null) as object | null,
            logs,
            duration,
            status: LogicFunctionExecutionStatus.SUCCESS,
          };
        }

        return {
          data: null,
          logs,
          duration,
          error: {
            errorType: 'UnhandledError',
            errorMessage: error || 'Unknown error',
            stackTrace: stack ? String(stack).split('\n') : [],
          },
          status: LogicFunctionExecutionStatus.ERROR,
        };
      } finally {
        consoleListener.release();
      }
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }

  async writeBootstrapRunner({
    dir,
    builtFileAbsPath,
    handlerName,
  }: {
    dir: string;
    builtFileAbsPath: string;
    handlerName: string;
  }) {
    const runnerPath = join(dir, '__runner.cjs');
    const code = `
      // Auto-generated. Do not edit.
      const { pathToFileURL } = require('node:url');

      (async () => {
        try {
          const builtUrl = pathToFileURL(${JSON.stringify(builtFileAbsPath)});
          const mod = await import(builtUrl.href);
          if (typeof mod.${handlerName} !== 'function') {
            throw new Error('Export "${handlerName}" not found in function bundle');
          }

          let payload = undefined;
          if (process.send) {
            process.on('message', async (msg) => {
              if (!msg || msg.type !== 'run') return;
              try {
                const out = await mod.${handlerName}(msg.payload);
                process.send && process.send({ ok: true, result: out });
                process.exit(0);
              } catch (err) {
                process.send && process.send({ ok: false, error: String(err), stack: err?.stack });
                process.exit(1);
              }
            });
          } else {
            // Fallback: read payload from argv[2] (JSON) and print to stdout
            const json = process.argv[2];
            payload = json ? JSON.parse(json) : undefined;
            const out = await mod.${handlerName}(payload);
            console.log(JSON.stringify({ ok: true, result: out }));
            process.exit(0);
          }
        } catch (err) {
          const msg = String(err);
          if (process.send) {
            process.send({ ok: false, error: msg, stack: err?.stack });
          } else {
            console.error(msg);
          }
          process.exit(1);
        }
      })();
    `;

    await fs.writeFile(runnerPath, code, 'utf8');

    return runnerPath;
  }

  runChildWithEnv(options: {
    runnerPath: string;
    env: Record<string, string>;
    payload: unknown;
    timeoutMs: number;
  }) {
    const { runnerPath, env, payload, timeoutMs } = options;

    return new Promise<{
      ok: boolean;
      result?: unknown;
      error?: string;
      stack?: string;
      stdout: string;
      stderr: string;
    }>((resolve) => {
      // Strip NODE_OPTIONS to prevent tsx loader from being inherited
      const { NODE_OPTIONS: _n1, ...cleanProcessEnv } = process.env;
      const { NODE_OPTIONS: _n2, ...cleanUserEnv } = env;

      const child = spawn(process.execPath, [runnerPath], {
        env: { ...cleanProcessEnv, ...cleanUserEnv },
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      let stdout = '';
      let stderr = '';
      let settled = false;

      child.stdout?.on('data', (d) => (stdout += String(d)));
      child.stderr?.on('data', (d) => (stderr += String(d)));

      child.on(
        'message',
        (
          msg:
            | {
                ok: true;
                result?: unknown;
                stdout?: string;
                stderr?: string;
              }
            | {
                ok: false;
                error: string;
                stack?: string;
                stdout?: string;
                stderr?: string;
              },
        ) => {
          if (settled) return;
          settled = true;
          resolve({ ...msg, stdout, stderr });
        },
      );

      child.on('exit', (code) => {
        if (settled) return;
        settled = true;
        if (code === 0) {
          // Fallback path if no IPC (shouldn't happen with our stdio)
          resolve({ ok: true, stdout, stderr });
        } else {
          resolve({
            ok: false,
            error: `Exited with code ${code}`,
            stdout,
            stderr,
          });
        }
      });

      const t = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill('SIGKILL');
        resolve({
          ok: false,
          error: `Timed out after ${timeoutMs}ms`,
          stdout,
          stderr,
        });
      }, timeoutMs);

      // Kick it off
      child.send?.({ type: 'run', payload });

      child.on('close', () => clearTimeout(t));
    });
  }
}
