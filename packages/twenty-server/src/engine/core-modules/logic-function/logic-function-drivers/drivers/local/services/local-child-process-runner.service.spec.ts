import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';

describe('LocalChildProcessRunnerService', () => {
  it('preserves a thrown error name in the child-process result', async () => {
    jest.useRealTimers();

    const logicFunctionDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-retryable-logic-function-'),
    );

    try {
      const builtLogicFunctionPath = join(
        logicFunctionDirectory,
        'logic-function.mjs',
      );

      await writeFile(
        builtLogicFunctionPath,
        `export const main = async (_payload, context) => {
          const retryableError = new Error('Dependency unavailable on retry ' + context.retryCount);
          retryableError.name = 'RetryableLogicFunctionError';
          throw retryableError;
        };`,
        'utf8',
      );

      const localChildProcessRunnerService =
        new LocalChildProcessRunnerService();
      const runnerPath =
        await localChildProcessRunnerService.writeBootstrapRunner({
          dir: logicFunctionDirectory,
          builtFileAbsPath: builtLogicFunctionPath,
          handlerName: 'main',
        });

      const executionResult =
        await localChildProcessRunnerService.runChildWithEnv({
          runnerPath,
          env: {},
          payload: {},
          context: {
            retryCount: 2,
            maxRetries: 3,
            workspaceId: 'workspace-1',
            userWorkspaceId: null,
            workspaceMemberId: null,
          },
          timeoutMs: 5_000,
        });

      expect(executionResult).toMatchObject({
        ok: false,
        errorType: 'RetryableLogicFunctionError',
        error: 'Dependency unavailable on retry 2',
      });
    } finally {
      await rm(logicFunctionDirectory, { recursive: true, force: true });
      jest.useFakeTimers();
    }
  });

  it('does not copy host process.env into the child', async () => {
    jest.useRealTimers();

    const hostCanaryKey = 'TWENTY_HOST_ENV_CANARY';
    const previousCanary = process.env[hostCanaryKey];

    process.env[hostCanaryKey] = 'should-not-leak';

    const logicFunctionDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-logic-function-env-'),
    );

    try {
      const builtLogicFunctionPath = join(
        logicFunctionDirectory,
        'logic-function.mjs',
      );

      await writeFile(
        builtLogicFunctionPath,
        `export const main = async () => ({
          hasHostCanary: process.env.${hostCanaryKey} === 'should-not-leak',
          callerMark: process.env.TWENTY_FUNCTION_MARK ?? null,
          nodeOptions: process.env.NODE_OPTIONS ?? null,
        });`,
        'utf8',
      );

      const localChildProcessRunnerService =
        new LocalChildProcessRunnerService();
      const runnerPath =
        await localChildProcessRunnerService.writeBootstrapRunner({
          dir: logicFunctionDirectory,
          builtFileAbsPath: builtLogicFunctionPath,
          handlerName: 'main',
        });

      const executionResult =
        await localChildProcessRunnerService.runChildWithEnv({
          runnerPath,
          env: {
            TWENTY_FUNCTION_MARK: 'from-caller',
            NODE_OPTIONS: '--require ./should-not-run.js',
          },
          payload: {},
          context: {
            retryCount: 0,
            maxRetries: 0,
            workspaceId: 'workspace-1',
            userWorkspaceId: null,
            workspaceMemberId: null,
          },
          timeoutMs: 5_000,
        });

      expect(executionResult).toMatchObject({
        ok: true,
        result: {
          hasHostCanary: false,
          callerMark: 'from-caller',
          nodeOptions: null,
        },
      });
    } finally {
      if (previousCanary === undefined) {
        delete process.env[hostCanaryKey];
      } else {
        process.env[hostCanaryKey] = previousCanary;
      }

      await rm(logicFunctionDirectory, { recursive: true, force: true });
      jest.useFakeTimers();
    }
  });
});
