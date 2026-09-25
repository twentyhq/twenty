import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseApplicationLogLines } from 'src/engine/core-modules/event-logs/producers/application-log/parse-application-log-lines';
import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';

const runLogicFunction = async (logicFunctionSource: string) => {
  const logicFunctionDirectory = await mkdtemp(
    join(tmpdir(), 'twenty-logic-function-'),
  );

  try {
    const builtLogicFunctionPath = join(
      logicFunctionDirectory,
      'logic-function.mjs',
    );

    await writeFile(builtLogicFunctionPath, logicFunctionSource, 'utf8');

    const localChildProcessRunnerService = new LocalChildProcessRunnerService();
    const runnerPath =
      await localChildProcessRunnerService.writeBootstrapRunner({
        dir: logicFunctionDirectory,
        builtFileAbsPath: builtLogicFunctionPath,
        handlerName: 'main',
      });

    return await localChildProcessRunnerService.runChildWithEnv({
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
  } finally {
    await rm(logicFunctionDirectory, { recursive: true, force: true });
  }
};

describe('LocalChildProcessRunnerService', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it('preserves a thrown error name in the child-process result', async () => {
    const executionResult = await runLogicFunction(
      `export const main = async (_payload, context) => {
        const retryableError = new Error('Dependency unavailable on retry ' + context.retryCount);
        retryableError.name = 'RetryableLogicFunctionError';
        throw retryableError;
      };`,
    );

    expect(executionResult).toMatchObject({
      ok: false,
      errorType: 'RetryableLogicFunctionError',
      error: 'Dependency unavailable on retry 2',
    });
  });

  it('writes one log record per console call', async () => {
    const { stdout } = await runLogicFunction(
      `export const main = async () => {
        console.log({
          workspace: { id: 'workspace-id' },
          additionalData: { calendarChannelId: 'calendar-channel-id', syncStep: 'CALENDAR_EVENT_LIST_FETCH' },
        });
        console.warn('first line\\nsecond line');
        console.error(new Error('boom'));
        console.dir({ additionalData: { syncStep: 'CALENDAR_EVENT_LIST_FETCH' } }, { depth: null });
      };`,
    );

    expect(parseApplicationLogLines(stdout).map(({ level }) => level)).toEqual([
      'INFO',
      'WARN',
      'ERROR',
      'INFO',
    ]);
  });

  it('keeps the last log record and the returned value after a large output', async () => {
    const { result, stdout } = await runLogicFunction(
      `export const main = async () => {
        for (let index = 0; index < 1_500; index++) {
          console.log(index + ' ' + 'x'.repeat(100));
        }
        console.error('last');
        return { answer: 42 };
      };`,
    );

    const parsedLogLines = parseApplicationLogLines(stdout);

    expect(parsedLogLines[parsedLogLines.length - 1]).toMatchObject({
      level: 'ERROR',
      message: 'last',
    });
    expect(result).toEqual({ answer: 42 });
  });
});
