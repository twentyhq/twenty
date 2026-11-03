import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { runDocker } from '@/local/run-docker';

const directory = await mkdtemp(join(tmpdir(), 'twenty-local-runtime-'));

beforeAll(async () => {
  await writeFile(
    join(directory, 'docker'),
    `#!${process.execPath}
if (process.argv[2] === 'fail') {
  process.stderr.write('image version does not exist');
  process.exitCode = 1;
} else if (process.argv[2] === 'unicode') {
  const stdout = Buffer.from('é🙂');
  const stderr = Buffer.from('汉');
  process.stdout.write(stdout.subarray(0, 1));
  setTimeout(() => process.stderr.write(stderr.subarray(0, 1)), 50);
  setTimeout(() => process.stdout.write(stdout.subarray(1)), 100);
  setTimeout(() => process.stderr.write(stderr.subarray(1)), 150);
} else if (process.argv[2] === 'logs') {
  process.on('SIGTERM', () => {});
  process.stdout.write(String(process.pid));
  setInterval(() => {}, 100);
} else {
  process.stdout.write(JSON.stringify(process.argv.slice(2)));
}
`,
    { mode: 0o700 },
  );
});
afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Docker subprocess', () => {
  it('passes arguments literally without invoking a shell', async () => {
    vi.stubEnv('PATH', directory);
    const args = ['inspect', 'value; $(echo injected)'];
    expect(
      JSON.parse(
        await runDocker({ args, signal: new AbortController().signal }),
      ),
    ).toEqual(args);
  });

  it('preserves split UTF-8 characters independently on stdout and stderr', async () => {
    vi.stubEnv('PATH', directory);
    let output = '';
    await runDocker({
      args: ['unicode'],
      signal: new AbortController().signal,
      onOutput: async (message) => {
        output += message;
      },
    });
    expect(output).toBe('é🙂汉');
  });

  it('reports Docker failures with the actual diagnostic', async () => {
    vi.stubEnv('PATH', directory);
    await expect(
      runDocker({ args: ['fail'], signal: new AbortController().signal }),
    ).rejects.toMatchObject({
      code: 'LOCAL_ENVIRONMENT_FAILED',
      message: 'docker fail failed: image version does not exist',
    });
  });

  it('reports a missing Docker executable as a runtime failure', async () => {
    vi.stubEnv('PATH', join(directory, 'absent'));
    await expect(
      runDocker({ args: ['info'], signal: new AbortController().signal }),
    ).rejects.toMatchObject({
      code: 'LOCAL_ENVIRONMENT_FAILED',
    });
  });

  it('emits the CLI cancellation envelope on a real SIGINT while Docker is running', async () => {
    const fixture = join(directory, 'command.cjs');
    const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
    await build({
      stdin: {
        contents: `
          import { runCommand } from './program/run-command';
          import { runDocker } from './local/run-docker';
          void runCommand({
            definition: {
              path: ['local', 'logs'], outputModes: ['ndjson'], needsTarget: false,
              load: async () => async ({ signal, output }) => {
                await runDocker({ args: ['logs'], signal, onOutput: async (message) => output.event('record', { message }, signal) });
                return { data: {} };
              },
            },
            outputMode: 'ndjson', commandArguments: [], options: {},
          });
        `,
        resolveDir: sourceRoot,
      },
      tsconfig: join(sourceRoot, '../tsconfig.json'),
      outfile: fixture,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      logLevel: 'silent',
    });
    const result = await new Promise<{ code: number | null; output: string }>(
      (resolve, reject) => {
        const child = spawn(process.execPath, [fixture], {
          env: { ...process.env, PATH: directory },
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        let output = '';
        let hasInterrupted = false;
        const timeout = setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('Cancellation timed out'));
        }, 5000);
        child.stdout.on('data', (chunk) => {
          output += String(chunk);
          if (!hasInterrupted && output.includes('\n')) {
            hasInterrupted = true;
            child.kill('SIGINT');
          }
        });
        child.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once('close', (code) => {
          clearTimeout(timeout);
          resolve({ code, output });
        });
      },
    );
    expect(result.code).toBe(130);
    const events = result.output
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(events.at(-1)).toMatchObject({
      type: 'error',
      data: { code: 'CANCELLED' },
    });
    expect(() => process.kill(Number(events[0].data.message), 0)).toThrow();
  });

  it('cancels a streaming subprocess, including one that ignores SIGTERM', async () => {
    vi.stubEnv('PATH', directory);
    const controller = new AbortController();
    let processId = 0;
    await expect(
      runDocker({
        args: ['logs'],
        signal: controller.signal,
        onOutput: async (message) => {
          processId = Number(message);
          controller.abort();
        },
      }),
    ).rejects.toMatchObject({ code: 'CANCELLED' });
    expect(processId).toBeGreaterThan(0);
    expect(() => process.kill(processId, 0)).toThrow();
  });
});
