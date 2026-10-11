import { fork } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ACCESS_TOKEN = 'credential-that-must-not-appear-in-logs';

const FUNCTION_CODE = `
  export const handler = async ({ accessToken, shouldFail }) => {
    console.log({ accessToken });
    console.error(accessToken);
    process.stdout.write(accessToken);
    process.stderr.write(accessToken);
    setTimeout(() => console.warn(accessToken), 5);

    if (shouldFail) {
      const error = new Error(accessToken);
      error.name = accessToken;
      throw error;
    }

    return { externalAccountId: 'provider-account' };
  };
`;

type ExecutionOutcome = {
  data?: { externalAccountId: string };
  error?: { name: string; message: string; stack: string };
};

const executeRuntime = async ({
  shouldSuppressExecutionLogs,
  shouldFail,
}: {
  shouldSuppressExecutionLogs?: boolean;
  shouldFail: boolean;
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'sensitive-executor-test-'));
  const runnerPath = join(directory, 'runner.mjs');
  const executorUrl = pathToFileURL(
    resolve(__dirname, '../../../constants/executor/index.mjs'),
  ).href;

  await writeFile(
    runnerPath,
    `
      import { handler } from ${JSON.stringify(executorUrl)};

      process.on('message', async (event) => {
        let outcome;
        try {
          outcome = { data: await handler(event) };
        } catch (error) {
          outcome = {
            error: { name: error.name, message: error.message, stack: error.stack },
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 20));
        process.send(outcome, () => process.exit(0));
      });
    `,
  );

  try {
    return await new Promise<ExecutionOutcome & { logs: string }>(
      (resolveOutcome, reject) => {
        const child = fork(runnerPath, [], {
          execArgv: [],
          env: { ...process.env, NODE_OPTIONS: '' },
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        });
        let logs = '';
        let outcome: ExecutionOutcome | undefined;
        const timeout = setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('Executor test process timed out'));
        }, 5_000);

        child.stdout?.on('data', (chunk) => {
          logs += String(chunk);
        });
        child.stderr?.on('data', (chunk) => {
          logs += String(chunk);
        });
        child.on('message', (message: ExecutionOutcome) => {
          outcome = message;
        });
        child.on('error', reject);
        child.on('close', () => {
          clearTimeout(timeout);
          if (outcome === undefined) {
            reject(new Error('Executor did not return an outcome'));
            return;
          }
          resolveOutcome({ ...outcome, logs });
        });
        child.send({
          code: FUNCTION_CODE,
          params: { accessToken: ACCESS_TOKEN, shouldFail },
          context: {},
          env: {},
          handlerName: 'handler',
          shouldSuppressExecutionLogs,
        });
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

describe('sensitive Lambda executor output', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it('preserves the result without emitting console or stream output', async () => {
    const result = await executeRuntime({
      shouldSuppressExecutionLogs: true,
      shouldFail: false,
    });

    expect(result).toEqual({
      data: { externalAccountId: 'provider-account' },
      logs: '',
    });
  });

  it('removes credential-bearing error details before Lambda records them', async () => {
    const result = await executeRuntime({
      shouldSuppressExecutionLogs: true,
      shouldFail: true,
    });

    expect(result.logs).toBe('');
    expect(result.error).toMatchObject({
      name: 'Error',
      message: 'Logic function execution failed',
    });
    expect(JSON.stringify(result)).not.toContain(ACCESS_TOKEN);
  });

  it.each([false, true])(
    'preserves ordinary execution output when shouldFail is %s',
    async (shouldFail) => {
      const result = await executeRuntime({ shouldFail });

      expect(result.logs).toContain(ACCESS_TOKEN);
      if (shouldFail) {
        expect(result.error).toMatchObject({
          name: ACCESS_TOKEN,
          message: ACCESS_TOKEN,
        });
      } else {
        expect(result.data).toEqual({ externalAccountId: 'provider-account' });
      }
    },
  );
});
