import { promises as fs } from 'fs';
import { spawn } from 'node:child_process';
import { join } from 'path';

import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOCAL_FETCH_RELAY_MAX_CONCURRENT_REQUESTS } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';
import { LOCAL_FETCH_RELAY_BOOTSTRAP_CODE } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-fetch-relay-bootstrap-code.constant';
import {
  type LocalFetchRelayHandler,
  type LocalFetchRelayRequest,
  type LocalFetchRelayResponse,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-fetch-relay.type';
import { buildLocalChildProcessEnv } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-env.util';
import { buildLocalChildProcessNodeFlags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-node-flags.util';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';
import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

type LocalFetchRelayChildMessage = {
  type: 'fetch';
  id: number;
  request: LocalFetchRelayRequest;
};

type LocalChildProcessMessage =
  | LocalFetchRelayChildMessage
  | { type: 'fetchAbort'; id: number }
  | { ok: true; result?: unknown }
  | { ok: false; errorType?: string; error: string; stack?: string };

export class LocalChildProcessRunnerService {
  // twenty-client-sdk comes from the SDK layer (workspace-specific generated client), not the deps layer.
  async assembleNodeModules({
    sourceTemporaryDir,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    sourceTemporaryDir: string;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const { depsLayerDirectory, sdkLayerDirectory } = this.getLayerDirectories({
      flatApplication,
      applicationUniversalIdentifier,
    });
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
    shouldRelayFetch,
  }: {
    dir: string;
    builtFileAbsPath: string;
    handlerName: string;
    shouldRelayFetch: boolean;
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

      ${shouldRelayFetch ? LOCAL_FETCH_RELAY_BOOTSTRAP_CODE : 'const settleRelayedFetch = () => {};'}

      // A 'message' listener starts the IPC read, so the run message is kept until the handler loads.
      let resolveRunMessage;
      const runMessage = new Promise((resolve) => {
        resolveRunMessage = resolve;
      });

      if (process.send) {
        process.on('message', (message) => {
          if (message?.type === 'run') {
            resolveRunMessage(message);
          }
          if (message?.type === 'fetchResult') {
            settleRelayedFetch(message);
          }
        });
      }

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
            const { payload: runPayload, context: runContext } = await runMessage;
            try {
              const out = await handlerFn(runPayload, runContext);
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
    applicationUniversalIdentifier: string;
    env: Record<string, string>;
    payload: unknown;
    context: LogicFunctionExecutionContext;
    timeoutMs: number;
    fetchRelayHandler?: LocalFetchRelayHandler;
  }) {
    const {
      runnerPath,
      executionDirectory,
      flatApplication,
      applicationUniversalIdentifier,
      env,
      payload,
      context,
      timeoutMs,
      fetchRelayHandler,
    } = options;

    const temporaryDirectory = join(executionDirectory, 'tmp');

    await fs.mkdir(temporaryDirectory, { recursive: true });

    const nodeFlags = buildLocalChildProcessNodeFlags({
      readableDirectories: [
        executionDirectory,
        ...Object.values(
          this.getLayerDirectories({
            flatApplication,
            applicationUniversalIdentifier,
          }),
        ),
      ],
      writableDirectory: temporaryDirectory,
      // Node 25+ needs --allow-net under --permission; relayed handlers only reach the network through the server.
      allowNetwork:
        !isDefined(fetchRelayHandler) &&
        process.allowedNodeEnvironmentFlags.has('--allow-net'),
    });

    const childEnv = buildLocalChildProcessEnv({
      hostEnv: process.env,
      functionEnv: env,
      temporaryDirectory,
    });

    return new Promise<{
      ok: boolean;
      result?: unknown;
      errorType?: string;
      error?: string;
      stack?: string;
      stdout: string;
      stderr: string;
    }>((resolve) => {
      const child = spawn(process.execPath, [...nodeFlags, runnerPath], {
        cwd: executionDirectory,
        env: childEnv,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      let stdout = '';
      let stderr = '';
      let settled = false;

      child.stdout?.on('data', (d) => (stdout += String(d)));
      child.stderr?.on('data', (d) => (stderr += String(d)));

      // Aborted when the handler process exits so its pending requests stop with it.
      const relayAbortController = new AbortController();
      const relayedFetchAbortControllers = new Map<number, AbortController>();
      let inFlightRelayedFetchCount = 0;

      const sendFetchResult = (
        id: number,
        result: { response: LocalFetchRelayResponse } | { error: string },
      ) => {
        if (settled || !child.connected) {
          return;
        }

        // Without its reply the handler would wait until the timeout.
        child.send({ type: 'fetchResult', id, ...result }, (sendError) => {
          if (isDefined(sendError)) {
            child.kill('SIGKILL');
          }
        });
      };

      const relayFetchRequest = async ({
        message: { id, request },
        handler,
      }: {
        message: Pick<LocalFetchRelayChildMessage, 'id' | 'request'>;
        handler: LocalFetchRelayHandler;
      }) => {
        if (
          inFlightRelayedFetchCount >= LOCAL_FETCH_RELAY_MAX_CONCURRENT_REQUESTS
        ) {
          sendFetchResult(id, {
            error: `Too many concurrent fetch requests (limit ${LOCAL_FETCH_RELAY_MAX_CONCURRENT_REQUESTS})`,
          });

          return;
        }

        inFlightRelayedFetchCount++;

        const requestAbortController = new AbortController();

        relayedFetchAbortControllers.set(id, requestAbortController);

        // The message comes from handler code, so a malformed request must not throw here.
        const result = await Promise.resolve()
          .then(() =>
            handler({
              request,
              signal: AbortSignal.any([
                relayAbortController.signal,
                requestAbortController.signal,
              ]),
            }),
          )
          .then(
            (response) => ({ response }),
            (error: unknown) => ({
              error: error instanceof Error ? error.message : String(error),
            }),
          )
          .finally(() => {
            inFlightRelayedFetchCount--;
            relayedFetchAbortControllers.delete(id);
          });

        sendFetchResult(id, result);
      };

      child.on('message', (message: LocalChildProcessMessage) => {
        if (!isDefined(message) || typeof message !== 'object') {
          return;
        }

        if ('type' in message) {
          if (message.type === 'fetchAbort') {
            relayedFetchAbortControllers.get(message.id)?.abort();

            return;
          }

          if (message.type !== 'fetch' || !isDefined(fetchRelayHandler)) {
            return;
          }

          void relayFetchRequest({ message, handler: fetchRelayHandler });

          return;
        }

        if (typeof message.ok !== 'boolean' || settled) {
          return;
        }

        settled = true;
        resolve({ ...message, stdout, stderr });
      });

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
        child.kill('SIGKILL');
        if (settled) return;
        settled = true;
        resolve({
          ok: false,
          error: `Timed out after ${timeoutMs}ms`,
          stdout,
          stderr,
        });
      }, timeoutMs);

      child.send?.({ type: 'run', payload, context });

      child.on('close', () => {
        clearTimeout(t);
        relayAbortController.abort();
      });
    });
  }

  private getLayerDirectories({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    return {
      depsLayerDirectory: getLocalDepsLayerPath(flatApplication),
      sdkLayerDirectory: getLocalSdkLayerPath({
        workspaceId: flatApplication.workspaceId,
        applicationUniversalIdentifier,
      }),
    };
  }
}
