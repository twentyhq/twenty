import { promises as fs } from 'fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'path';

import { build } from 'esbuild';
import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';

import {
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionDriver,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { ConsoleListener } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/intercept-console';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { copyYarnEngineAndBuildDependencies } from 'src/engine/core-modules/application/application-package/utils/copy-yarn-engine-and-build-dependencies';
import type { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import type { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client-generation/sdk-client-generation.service';

export interface LocalDriverOptions {
  logicFunctionResourceService: LogicFunctionResourceService;
  sdkClientGenerationService: SdkClientGenerationService;
}

export class LocalDriver implements LogicFunctionDriver {
  private readonly logicFunctionResourceService: LogicFunctionResourceService;
  private readonly sdkClientGenerationService: SdkClientGenerationService;

  constructor(options: LocalDriverOptions) {
    this.logicFunctionResourceService = options.logicFunctionResourceService;
    this.sdkClientGenerationService = options.sdkClientGenerationService;
  }

  private getDepsLayerPath(flatApplication: FlatApplication): string {
    const checksum = flatApplication.yarnLockChecksum ?? 'default';

    return join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps', checksum);
  }

  private getSdkLayerPath({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): string {
    return join(
      LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER,
      'sdk',
      `${workspaceId}-${applicationUniversalIdentifier}`,
    );
  }

  private async createLayerIfNotExist({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const depsLayerPath = this.getDepsLayerPath(flatApplication);

    try {
      await fs.access(depsLayerPath);

      return;
    } catch {
      // Layer doesn't exist yet
    }

    await this.logicFunctionResourceService.copyDependenciesInMemory({
      applicationUniversalIdentifier,
      workspaceId: flatApplication.workspaceId,
      inMemoryFolderPath: depsLayerPath,
    });
    await copyYarnEngineAndBuildDependencies(depsLayerPath);
  }

  private async ensureSdkLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const sdkLayerPath = this.getSdkLayerPath({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    const layerExists = await fs
      .access(sdkLayerPath)
      .then(() => true)
      .catch(() => false);

    if (layerExists && !flatApplication.isSdkLayerStale) {
      return;
    }

    await fs.rm(sdkLayerPath, { recursive: true, force: true });

    const sdkPackagePath = join(
      sdkLayerPath,
      'node_modules',
      'twenty-client-sdk',
    );

    await this.sdkClientGenerationService.downloadAndExtractToPackage({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
      targetPackagePath: sdkPackagePath,
    });

    await this.sdkClientGenerationService.markSdkLayerFresh({
      applicationId: flatApplication.id,
      workspaceId: flatApplication.workspaceId,
    });
  }

  async transpile({
    sourceCode,
    sourceFileName,
    builtFileName,
  }: LogicFunctionTranspileParams): Promise<LogicFunctionTranspileResult> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir } = await temporaryDirManager.init();

    try {
      const entryFilePath = join(sourceTemporaryDir, sourceFileName);
      const builtBundleFilePath = join(sourceTemporaryDir, builtFileName);

      await fs.mkdir(dirname(entryFilePath), { recursive: true });
      await fs.writeFile(entryFilePath, sourceCode, 'utf-8');
      await fs.mkdir(dirname(builtBundleFilePath), { recursive: true });

      await build({
        entryPoints: [entryFilePath],
        outfile: builtBundleFilePath,
        platform: 'node',
        format: 'esm',
        target: 'es2017',
        bundle: true,
        sourcemap: true,
        packages: 'external',
        banner: NODE_ESM_CJS_BANNER,
      });

      const builtCode = await fs.readFile(builtBundleFilePath, 'utf-8');

      return { builtCode };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async delete() {}

  async build({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    await this.createLayerIfNotExist({
      flatApplication,
      applicationUniversalIdentifier,
    });
    await this.ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });
  }

  // Symlinks everything from the deps layer except twenty-client-sdk,
  // which comes from the SDK layer (workspace-specific generated client).
  private async assembleNodeModules({
    sourceTemporaryDir,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    sourceTemporaryDir: string;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const depsNodeModules = join(
      this.getDepsLayerPath(flatApplication),
      'node_modules',
    );
    const sdkNodeModules = join(
      this.getSdkLayerPath({
        workspaceId: flatApplication.workspaceId,
        applicationUniversalIdentifier,
      }),
      'node_modules',
    );
    const execNodeModules = join(sourceTemporaryDir, 'node_modules');

    await fs.mkdir(execNodeModules, { recursive: true });

    const entries = await fs.readdir(depsNodeModules, {
      withFileTypes: true,
    });

    const symlinkPromises = entries
      .filter((entry) => entry.name !== 'twenty-client-sdk')
      .map((entry) =>
        fs.symlink(
          join(depsNodeModules, entry.name),
          join(execNodeModules, entry.name),
          entry.isDirectory() ? 'dir' : 'file',
        ),
      );

    await Promise.all(symlinkPromises);

    await fs.symlink(
      join(sdkNodeModules, 'twenty-client-sdk'),
      join(execNodeModules, 'twenty-client-sdk'),
      'dir',
    );
  }

  async execute({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
    payload,
    env,
    timeoutMs = 900_000,
  }: LogicFunctionExecuteParams): Promise<LogicFunctionExecuteResult> {
    await this.createLayerIfNotExist({
      flatApplication,
      applicationUniversalIdentifier,
    });
    await this.ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const startTime = Date.now();

    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      const inMemoryBuiltHandlerPath =
        await this.logicFunctionResourceService.copyBuiltCodeInMemory({
          workspaceId: flatLogicFunction.workspaceId,
          applicationUniversalIdentifier,
          builtHandlerPath: flatLogicFunction.builtHandlerPath,
          inMemoryDestinationPath: sourceTemporaryDir,
        });

      await this.assembleNodeModules({
        sourceTemporaryDir,
        flatApplication,
        applicationUniversalIdentifier,
      });

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
                    return '[Circular]';
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
        const runnerPath = await this.writeBootstrapRunner({
          dir: sourceTemporaryDir,
          builtFileAbsPath: inMemoryBuiltHandlerPath,
          handlerName: flatLogicFunction.handlerName,
        });

        const { ok, result, error, stack, stdout, stderr } =
          await this.runChildWithEnv({
            runnerPath,
            env: env ?? {},
            payload,
            timeoutMs,
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
      await temporaryDirManager.clean();
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
    if (!HANDLER_NAME_REGEX.test(handlerName)) {
      throw new Error(
        `Invalid handlerName "${handlerName}": must be a valid JavaScript identifier or dotted path`,
      );
    }

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
            process.stdout.write(JSON.stringify({ ok: true, result: out }));
            process.exit(0);
          }
        } catch (err) {
          const msg = String(err);
          if (process.send) {
            process.send({ ok: false, error: msg, stack: err?.stack });
          } else {
            process.stdout.write(msg);
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

      child.send?.({ type: 'run', payload });

      child.on('close', () => clearTimeout(t));
    });
  }
}
