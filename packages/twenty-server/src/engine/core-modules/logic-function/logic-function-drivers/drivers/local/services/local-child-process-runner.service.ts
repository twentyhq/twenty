import { promises as fs } from 'fs';
import { type ChildProcess, spawn } from 'node:child_process';
import { join } from 'path';

import { isObject } from '@sniptt/guards';

import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildLocalChildProcessEnv } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-env.util';
import { buildLocalChildProcessNodeFlags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-node-flags.util';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';
import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

const childProcessResultSchema = z.object({
  ok: z.boolean(),
  result: z.unknown().optional(),
  errorType: z.string().optional(),
  error: z.string().optional(),
  stack: z.string().optional(),
});

export class LocalChildProcessRunnerService {
  // twenty-client-sdk comes from the SDK layer (workspace-specific generated client), not the deps layer.
  async assembleNodeModules({
    sourceTemporaryDir,
    flatApplication,
  }: {
    sourceTemporaryDir: string;
    flatApplication: FlatApplication;
  }): Promise<void> {
    const { depsLayerDirectory, sdkLayerDirectory } =
      this.getLayerDirectories(flatApplication);
    const depsNodeModules = join(depsLayerDirectory, 'node_modules');
    const sdkNodeModules = join(sdkLayerDirectory, 'node_modules');
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
    const handlerAccessor = `mod?.${handlerName.split('.').join('?.')}`;
    const code = `
      // Auto-generated. Do not edit.
      const { pathToFileURL } = require('node:url');

      (async () => {
        try {
          const builtUrl = pathToFileURL(${JSON.stringify(builtFileAbsPath)});
          const mod = await import(builtUrl.href);
          const handlerFn = ${handlerAccessor};
          if (typeof handlerFn !== 'function') {
            throw new Error('Export "' + ${JSON.stringify(handlerName)} + '" not found in function bundle');
          }

          let payload = undefined;
          if (process.send) {
            process.on('message', async (msg) => {
              if (!msg || msg.type !== 'run') return;
              try {
                const out = await handlerFn(msg.payload, msg.context);
                // Wait for the async IPC flush before exiting, otherwise results
                // larger than the OS pipe buffer are dropped before delivery.
                if (process.send) {
                  process.send({ ok: true, result: out }, () => process.exit(0));
                } else {
                  process.exit(0);
                }
              } catch (error) {
                if (process.send) {
                  process.send({
                    ok: false,
                    errorType: error instanceof Error ? error.name : 'Error',
                    error: error instanceof Error ? error.message : String(error),
                    stack: error?.stack,
                  }, () => process.exit(1));
                } else {
                  process.exit(1);
                }
              }
            });
          } else {
            // Fallback for a runner started without IPC: the context travels as
            // argv[3] because the script is written once, before any run exists.
            const json = process.argv[2];
            payload = json ? JSON.parse(json) : undefined;
            const contextJson = process.argv[3];
            const out = await handlerFn(payload, contextJson ? JSON.parse(contextJson) : undefined);
            process.stdout.write(JSON.stringify({ ok: true, result: out }), () => process.exit(0));
          }
        } catch (error) {
          const errorMessage = String(error);
          if (process.send) {
            process.send({
              ok: false,
              errorType: error instanceof Error ? error.name : 'Error',
              error: error instanceof Error ? error.message : errorMessage,
              stack: error?.stack,
            }, () => process.exit(1));
          } else {
            process.stdout.write(errorMessage, () => process.exit(1));
          }
        }
      })();
    `;

    await fs.writeFile(runnerPath, code, 'utf8');

    return runnerPath;
  }

  async runChildWithEnv(options: {
    runnerPath: string;
    executionDirectory: string;
    flatApplication: FlatApplication;
    env: Record<string, string>;
    payload: unknown;
    context: LogicFunctionExecutionContext;
    timeoutMs: number;
  }) {
    const {
      runnerPath,
      executionDirectory,
      flatApplication,
      env,
      payload,
      context,
      timeoutMs,
    } = options;

    const temporaryDirectory = join(executionDirectory, 'tmp');

    await fs.mkdir(temporaryDirectory, { recursive: true });

    const nodeFlags = buildLocalChildProcessNodeFlags({
      readableDirectories: [
        executionDirectory,
        ...Object.values(this.getLayerDirectories(flatApplication)),
      ],
      writableDirectory: temporaryDirectory,
      // Node 25+ denies network access under --permission unless --allow-net is passed.
      shouldAllowNetwork:
        process.allowedNodeEnvironmentFlags.has('--allow-net'),
    });

    const childEnv = buildLocalChildProcessEnv({
      hostEnv: process.env,
      functionEnv: env,
      temporaryDirectory,
    });

    return this.runChild({
      runnerPath,
      executionDirectory,
      env: childEnv,
      nodeFlags,
      payload,
      context,
      timeoutMs,
    });
  }

  async runChild({
    runnerPath,
    executionDirectory,
    env,
    nodeFlags = [],
    payload,
    context,
    timeoutMs,
    maxOutputLength,
  }: {
    runnerPath: string;
    executionDirectory: string;
    env: NodeJS.ProcessEnv;
    nodeFlags?: string[];
    payload: unknown;
    context?: LogicFunctionExecutionContext;
    timeoutMs: number;
    maxOutputLength?: number;
  }) {
    const child = spawn(process.execPath, [...nodeFlags, runnerPath], {
      cwd: executionDirectory,
      env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      detached: true,
    });
    const closed = new Promise<void>((resolve) =>
      child.once('close', () => resolve()),
    );
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (isDefined(maxOutputLength)) {
        stdout = stdout.slice(-maxOutputLength);
      }
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
      if (isDefined(maxOutputLength)) {
        stderr = stderr.slice(-maxOutputLength);
      }
    });

    let result: z.infer<typeof childProcessResultSchema>;
    try {
      result = await new Promise<z.infer<typeof childProcessResultSchema>>(
        (resolve) => {
          child.once('message', (message: unknown) => {
            const parsed = childProcessResultSchema.safeParse(message);

            resolve(
              parsed.success
                ? parsed.data
                : { ok: false, error: 'Invalid child process response' },
            );
          });
          child.once('error', (error) =>
            resolve({ ok: false, error: error.message, errorType: error.name }),
          );
          child.once('exit', (code, signal) =>
            resolve(
              code === 0
                ? { ok: true }
                : { ok: false, error: `Exited with code ${signal ?? code}` },
            ),
          );
          timeout = setTimeout(
            () =>
              resolve({ ok: false, error: `Timed out after ${timeoutMs}ms` }),
            timeoutMs,
          );
          child.send({ type: 'run', payload, context }, (error) => {
            if (isDefined(error)) {
              resolve({
                ok: false,
                error: error.message,
                errorType: error.name,
              });
            }
          });
        },
      );
    } finally {
      clearTimeout(timeout);
      this.killChildProcess(child);
      await closed;
    }
    return { ...result, stdout, stderr };
  }

  private killChildProcess(child: ChildProcess) {
    if (!isDefined(child.pid)) {
      return;
    }

    try {
      // Yarn and esbuild must exit before their temporary files are removed.
      process.kill(-child.pid, 'SIGKILL');
    } catch (error) {
      const code = isObject(error) && 'code' in error ? error.code : undefined;

      if (code === 'ESRCH') {
        return;
      }

      if (code !== 'EPERM') {
        throw error;
      }

      child.kill('SIGKILL');
    }
  }

  private getLayerDirectories(flatApplication: FlatApplication) {
    return {
      depsLayerDirectory: getLocalDepsLayerPath(flatApplication),
      sdkLayerDirectory: getLocalSdkLayerPath({
        workspaceId: flatApplication.workspaceId,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
      }),
    };
  }
}
