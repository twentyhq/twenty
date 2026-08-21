import { promises as fs } from 'fs';
import { spawn } from 'node:child_process';
import { join } from 'path';

import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';
import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

export class LocalChildProcessRunnerService {
  // Symlinks everything from the deps layer except twenty-client-sdk,
  // which comes from the SDK layer (workspace-specific generated client).
  async assembleNodeModules({
    sourceTemporaryDir,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    sourceTemporaryDir: string;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const depsNodeModules = join(
      getLocalDepsLayerPath(flatApplication),
      'node_modules',
    );
    const sdkNodeModules = join(
      getLocalSdkLayerPath({
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

  runChildWithEnv(options: {
    runnerPath: string;
    env: Record<string, string>;
    payload: unknown;
    context: LogicFunctionExecutionContext;
    timeoutMs: number;
  }) {
    const { runnerPath, env, payload, context, timeoutMs } = options;

    return new Promise<{
      ok: boolean;
      result?: unknown;
      errorType?: string;
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
                errorType?: string;
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

      child.send?.({ type: 'run', payload, context });

      child.on('close', () => clearTimeout(t));
    });
  }
}
