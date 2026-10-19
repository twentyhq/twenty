import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import execa from 'execa';
import { build as bundle } from 'esbuild';
import { createHash } from 'node:crypto';
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { runAppPublishCommand } from '@/commands/app/publish/run-app-publish-command';
import { createOutput } from '@/output/create-output';
import { runAppBuild } from '@/app/run-app-operation';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

vi.mock('@/app/run-app-operation', () => ({ runAppBuild: vi.fn() }));

const PACKAGE_FILES = {
  'package.json': JSON.stringify({ name: '@test/billing', version: '1.2.3' }),
  'manifest.json': JSON.stringify({
    application: { universalIdentifier: 'test-app' },
  }),
  'src/main.mjs': 'export const main = () => 42;',
  'yarn.lock': 'lockfile',
};

let root: string;
let appPath: string;
let snapshotDirectory: string;
let build: ToolingBuild;

const readInvocations = async () =>
  (await readFile(join(root, 'invocations.jsonl'), 'utf8').catch(() => ''))
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
const runPublish = async (args: string[] = []) => {
  const result = await runCliForTest([
    'app',
    'publish',
    '--path',
    appPath,
    ...args,
    '--json',
  ]);
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};

// The fixture replaces npm on PATH, so these tests never publish a package.
const NPM_FIXTURE = String.raw`#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const root = process.env.PUBLISH_TEST_ROOT;
fs.appendFileSync(path.join(root, 'invocations.jsonl'), JSON.stringify({ args, cwd: process.cwd(), packageExists: args[0] === 'publish' ? fs.existsSync(args[1]) : null }) + '\n');
if (process.env.PUBLISH_TEST_FAIL === args[0]) {
  console.error('Registry refused this version');
  process.exit(9);
}
if (process.env.PUBLISH_TEST_TTY === 'true' && (!process.stdin.isTTY || !process.stdout.isTTY)) {
  console.error('EOTP: terminal input and output required');
  process.exit(9);
}
if (process.env.PUBLISH_TEST_HANG === args[0]) {
  process.on('SIGTERM', () => {});
  setInterval(() => {}, 1000);
} else if (args[0] === 'pack' && process.env.PUBLISH_TEST_PACK_OUTPUT) {
  console.log(process.env.PUBLISH_TEST_PACK_OUTPUT);
} else if (args[0] === 'pack') {
  const destination = args[args.indexOf('--pack-destination') + 1];
  const filename = 'test-billing-1.2.3.tgz';
  fs.writeFileSync(path.join(destination, filename), 'packed bytes');
  const files = ['package.json', 'manifest.json', 'src/main.mjs'].filter(file => file !== process.env.PUBLISH_TEST_OMIT);
  console.log(JSON.stringify([{ name: '@test/billing', version: '1.2.3', filename, files: files.map(path => ({ path })) }]));
} else {
  console.log('npm output must not corrupt the CLI JSON');
}
`;

describe.skipIf(process.platform === 'win32')('app publish', () => {
  beforeEach(async () => {
    root = await realpath(await mkdtemp(join(tmpdir(), 'twenty-publish-')));
    appPath = join(root, 'app with spaces');
    snapshotDirectory = join(appPath, '.twenty/cli/snapshots/build-1/files');
    await mkdir(join(root, 'bin'));
    const executable = join(root, 'bin/npm');
    await writeFile(executable, NPM_FIXTURE);
    await chmod(executable, 0o755);
    vi.stubEnv('PATH', `${join(root, 'bin')}${delimiter}${process.env.PATH}`);
    vi.stubEnv('PUBLISH_TEST_ROOT', root);
    vi.stubEnv('PUBLISH_TEST_FAIL', '');
    vi.stubEnv('PUBLISH_TEST_HANG', '');
    vi.stubEnv('PUBLISH_TEST_TTY', '');
    vi.stubEnv('PUBLISH_TEST_OMIT', '');
    vi.stubEnv('PUBLISH_TEST_PACK_OUTPUT', '');
    vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_URL', undefined);
    vi.stubEnv('TWENTY_APP_PUBLISH_DISABLE_PROVENANCE', undefined);
    vi.stubEnv('CI', 'true');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_CONFIG_HOME', join(root, 'config'));

    for (const [file, content] of Object.entries(PACKAGE_FILES)) {
      await mkdir(dirname(join(snapshotDirectory, file)), { recursive: true });
      await writeFile(join(snapshotDirectory, file), content);
    }
    build = {
      buildId: 'build-1',
      directory: snapshotDirectory,
      contentHash: 'hash',
      application: {
        name: '@test/billing',
        displayName: 'Billing',
        universalIdentifier: 'test-app',
      },
      manifestFormat: 'twenty-application',
      manifest: {},
      files: Object.entries(PACKAGE_FILES)
        .filter(([path]) => path !== 'manifest.json')
        .map(([path, content]) => ({
          path,
          sourcePath: path,
          role: 'source',
          size: Buffer.byteLength(content),
          sha256: createHash('sha256').update(content).digest('hex'),
        })),
    };
    vi.mocked(runAppBuild).mockReset();
    vi.mocked(runAppBuild).mockImplementation(async ({ useHeldBuild }) => {
      const result = {
        project: { path: appPath, name: '@test/billing' },
        sdk: { version: '1.0.0', packagePath: '' },
        data: build,
        diagnostics: [],
        durationMilliseconds: 1,
      };
      try {
        await useHeldBuild?.(result);
        return result;
      } finally {
        await rm(dirname(snapshotDirectory), { recursive: true, force: true });
      }
    });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('publishes the held build with the tag, project npm configuration and clean JSON', async () => {
    const result = await runPublish(['--tag', 'beta']);
    expect(result.exitCode).toBe(0);
    expect(runAppBuild).toHaveBeenCalledExactlyOnceWith({
      context: expect.objectContaining({
        command: 'app publish',
        arguments: [],
        options: expect.objectContaining({ path: appPath, tag: 'beta' }),
        outputMode: 'json',
        output: expect.any(Object),
        signal: expect.any(AbortSignal),
      }),
      useHeldBuild: expect.any(Function),
    });
    expect(result.envelope.data).toMatchObject({
      target: 'npm',
      name: '@test/billing',
      version: '1.2.3',
      tag: 'beta',
    });
    expect(result.envelope).not.toHaveProperty('target');
    const invocations = await readInvocations();
    expect(invocations).toHaveLength(2);
    expect(invocations[0]).toMatchObject({
      cwd: appPath,
      args: [
        'pack',
        snapshotDirectory,
        '--json',
        '--ignore-scripts',
        '--workspaces=false',
        '--pack-destination',
        expect.any(String),
      ],
    });
    expect(invocations[1]).toMatchObject({
      cwd: appPath,
      packageExists: true,
      args: [
        'publish',
        expect.stringContaining('.tgz'),
        '--access',
        'public',
        '--ignore-scripts',
        '--workspaces=false',
        '--tag',
        'beta',
      ],
    });
    await expect(access(invocations[1].args[1])).rejects.toThrow();
  });

  it('forwards npm output as human progress', async () => {
    const result = await runCliForTest([
      'app',
      'publish',
      '--path',
      appPath,
      '--format',
      'human',
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain(
      'npm output must not corrupt the CLI JSON\n',
    );
    expect(result.stderr).not.toContain('[object Object]');
  });

  it.each([true, false])(
    'keeps the SDK provenance opt-out, disabled=%s',
    async (disabled) => {
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_URL', 'https://oidc.example.test');
      if (disabled) {
        vi.stubEnv('TWENTY_APP_PUBLISH_DISABLE_PROVENANCE', 'true');
      }
      expect((await runPublish()).exitCode).toBe(0);
      expect((await readInvocations())[1].args.includes('--provenance')).toBe(
        !disabled,
      );
    },
  );

  it.each([
    ['--tag', 'bad tag'],
    ['--remote', 'prod'],
  ])('rejects invalid options before building: %s', async (...args) => {
    const result = await runPublish(args);
    expect(result.exitCode).toBe(2);
    expect(result.envelope.error.code).toBe('INVALID_INPUT');
    expect(runAppBuild).not.toHaveBeenCalled();
    expect(await readInvocations()).toEqual([]);
  });

  it('does not invoke npm when the build fails', async () => {
    vi.mocked(runAppBuild).mockRejectedValueOnce(new Error('Build failed'));
    expect((await runPublish()).exitCode).toBe(1);
    expect(await readInvocations()).toEqual([]);
  });

  it.each([
    ['{invalid', 'npm pack returned invalid JSON.'],
    ['[]', 'npm pack returned an invalid package description.'],
    [
      JSON.stringify([
        {
          name: '@test/billing',
          version: '1.2.3',
          filename: '../outside.tgz',
          files: [],
        },
      ]),
      'npm pack returned an invalid package description.',
    ],
    [
      JSON.stringify([
        {
          name: '@test/billing',
          version: '1.2.3',
          filename: 'billing.tgz',
          files: [{ path: 1 }],
        },
      ]),
      'npm pack returned an invalid package file.',
    ],
  ])(
    'rejects invalid npm pack output before publishing: %s',
    async (stdout, message) => {
      vi.stubEnv('PUBLISH_TEST_PACK_OUTPUT', stdout);
      const result = await runPublish();
      expect(result.exitCode).toBe(1);
      expect(result.envelope.error).toMatchObject({
        code: 'PUBLISH_FAILED',
        message,
      });
      const invocations = await readInvocations();
      expect(invocations).toHaveLength(1);
      await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
    },
  );

  it.each(['manifest.json', 'src/main.mjs'])(
    'refuses a package that excludes %s',
    async (file) => {
      vi.stubEnv('PUBLISH_TEST_OMIT', file);
      const result = await runPublish();
      expect(result.exitCode).toBe(1);
      expect(result.envelope.error).toMatchObject({
        code: 'PUBLISH_FAILED',
        details: { missingPaths: [file] },
      });
      const invocations = await readInvocations();
      expect(invocations).toHaveLength(1);
      await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
    },
  );

  it.each(['pack', 'publish'])(
    'reports npm %s failure and removes the temporary package',
    async (operation) => {
      vi.stubEnv('PUBLISH_TEST_FAIL', operation);
      const result = await runPublish();
      expect(result.exitCode).toBe(1);
      expect(result.envelope.error).toMatchObject({
        code: 'PUBLISH_FAILED',
        details: {
          exitCode: 9,
          stderr: expect.stringContaining('Registry refused'),
        },
      });
      const invocations = await readInvocations();
      expect(invocations).toHaveLength(operation === 'pack' ? 1 : 2);
      await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
    },
  );

  it('cancels an unresponsive npm process and cleans the package', async () => {
    vi.stubEnv('PUBLISH_TEST_HANG', 'publish');
    const controller = new AbortController();
    const pending = runAppPublishCommand({
      command: 'app publish',
      arguments: [],
      options: { path: appPath },
      outputMode: 'json',
      output: createOutput({ mode: 'json', command: 'app publish' }),
      signal: controller.signal,
    }).catch((error: unknown) => error);
    await expect.poll(async () => (await readInvocations()).length).toBe(2);
    controller.abort();
    const result = await pending;
    expect(result).toMatchObject({ code: 'CANCELLED', exitCode: 130 });
    const invocations = await readInvocations();
    await expect(access(invocations[1].args[1])).rejects.toThrow();
  });

  it('preserves terminal input and output for npm two-factor prompts', async () => {
    vi.stubEnv('PUBLISH_TEST_TTY', 'true');
    const runner = join(root, 'run-npm.cjs');
    await bundle({
      stdin: {
        contents: `import { runNpmCommand } from './src/app/publish/run-npm-command';
          runNpmCommand({ args: ['publish', 'fixture.tgz'], appPath: ${JSON.stringify(appPath)}, signal: new AbortController().signal, canInteract: true }).catch(() => process.exit(1));`,
        resolveDir: process.cwd(),
      },
      outfile: runner,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      logLevel: 'silent',
    });
    const args =
      process.platform === 'darwin'
        ? ['-q', '/dev/null', process.execPath, runner]
        : ['-qec', `'${process.execPath}' '${runner}'`, '/dev/null'];
    const { stdout } = await execa('script', args, {
      stdin: 'ignore',
      timeout: 10_000,
    });
    expect(stdout).toContain('npm output must not corrupt the CLI JSON');
    expect(stdout).not.toContain('EOTP');
  });

  it('reports a missing npm executable', async () => {
    vi.stubEnv('PATH', join(root, 'missing-bin'));
    const result = await runPublish();
    expect(result.exitCode).toBe(1);
    expect(result.envelope.error.code).toBe('PUBLISH_FAILED');
    expect(result.envelope.error.hint).toContain('npm is installed');
  });

  it('advertises npm publishing without requiring a Twenty target', async () => {
    const result = await runCliForTest(['commands', '--json']);
    expect(parseSingleJsonLine(result.stdout).data.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'app publish',
          needsTarget: false,
          writes: true,
        }),
      ]),
    );
  });
  describe('private server registry', () => {
    let server: Awaited<ReturnType<typeof startTestServer>>;
    let failure: string | undefined;
    const fileId = '8ba383ca-7d8a-47b1-b41c-02c172d4d0dd';
    const registration = {
      id: 'registration-id',
      name: 'Billing',
      universalIdentifier: 'test-app',
    };

    beforeEach(async () => {
      failure = undefined;
      server = await startTestServer((request, response) => {
        if (request.method === 'PUT') {
          response.writeHead(
            failure === 'upload' ? 503 : failure === 'redirect' ? 302 : 200,
            failure === 'redirect'
              ? { location: `${server.url}/must-not-follow` }
              : {},
          );
          response.end();
          return;
        }
        const { query } = readGraphqlRequest(request);
        if (query.includes('createFileUpload')) {
          if (failure === 'reserve') {
            sendJson(response, 403, { message: 'Permission denied' });
            return;
          }
          sendJson(response, 200, {
            data: {
              createFileUpload:
                failure === 'invalid-target'
                  ? { fileId }
                  : {
                      fileId,
                      uploadUrl: `${server.url}/tarball`,
                      contentType: 'application/gzip',
                    },
            },
          });
          return;
        }
        if (query.includes('completeAppTarballUpload')) {
          if (failure === 'hold-complete') return;
          if (failure === 'complete') {
            sendJson(response, 200, {
              data: null,
              errors: [
                {
                  message: 'Version already exists',
                  extensions: { code: 'BAD_USER_INPUT' },
                },
              ],
            });
            return;
          }
          sendJson(response, 200, {
            data: {
              completeAppTarballUpload:
                failure === 'invalid-complete' ? null : registration,
            },
          });
          return;
        }
        sendJson(response, 500, { message: 'Unexpected operation' });
      });
      vi.stubEnv('TWENTY_API_URL', server.url);
      vi.stubEnv('TWENTY_API_KEY', 'test-api-key');
    });

    afterEach(async () => server.close());

    it('packs, uploads bytes without credentials, then registers without installing or publishing to npm', async () => {
      const result = await runPublish(['--private']);
      expect(result.exitCode).toBe(0);
      expect(result.envelope.data).toMatchObject({
        target: 'private',
        registry: { apiUrl: server.url },
        registration,
        fileId,
        installed: false,
      });
      expect(server.requests).toHaveLength(3);
      expect(readGraphqlRequest(server.requests[0]).arguments).toEqual({
        filename: 'test-billing-1.2.3.tgz',
        size: Buffer.byteLength('packed bytes'),
        fileFolder: 'AppTarball',
      });
      expect(server.requests[0].headers.authorization).toBe(
        'Bearer test-api-key',
      );
      expect(server.requests[1]).toMatchObject({
        method: 'PUT',
        path: '/tarball',
        body: 'packed bytes',
      });
      expect(server.requests[1].headers.authorization).toBeUndefined();
      expect(server.requests[1].headers['content-type']).toBe(
        'application/gzip',
      );
      expect(readGraphqlRequest(server.requests[2]).arguments).toEqual({
        fileId,
      });
      expect(server.requests[2].headers.authorization).toBe(
        'Bearer test-api-key',
      );
      const invocations = await readInvocations();
      expect(invocations).toHaveLength(1);
      expect(invocations[0].args[0]).toBe('pack');
      await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
    });

    it('refuses npm-only flags before building or contacting the target', async () => {
      const result = await runPublish(['--private', '--tag', 'beta']);
      expect(result.exitCode).toBe(2);
      expect(result.envelope.error.code).toBe('INVALID_INPUT');
      expect(runAppBuild).not.toHaveBeenCalled();
      expect(server.requests).toEqual([]);
    });

    it('requires a private target before building or packing', async () => {
      vi.stubEnv('TWENTY_API_KEY', '');
      const result = await runPublish(['--private']);
      expect(result.exitCode).not.toBe(0);
      expect(runAppBuild).not.toHaveBeenCalled();
      expect(await readInvocations()).toEqual([]);
      expect(server.requests).toEqual([]);
    });

    it('does not request an upload when packing fails', async () => {
      vi.stubEnv('PUBLISH_TEST_FAIL', 'pack');
      const result = await runPublish(['--private']);
      expect(result.exitCode).toBe(1);
      expect(result.envelope.error.code).toBe('PUBLISH_FAILED');
      expect(server.requests).toEqual([]);
    });

    it.each(['reserve', 'invalid-target', 'upload', 'redirect'])(
      'does not register when %s fails',
      async (reason) => {
        failure = reason;
        const result = await runPublish(['--private']);
        expect(result.exitCode).not.toBe(0);
        expect(result.envelope.error.details.outcome).toBe('not-published');
        expect(server.requests).toHaveLength(
          reason === 'reserve' || reason === 'invalid-target' ? 1 : 2,
        );
        expect(
          server.requests.some(
            (request) =>
              request.method === 'POST' &&
              readGraphqlRequest(request).query.includes(
                'completeAppTarballUpload',
              ),
          ),
        ).toBe(false);
        const invocations = await readInvocations();
        await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
      },
    );

    it.each(['complete', 'invalid-complete'])(
      'reports ambiguous registration failure for %s with the file ID',
      async (reason) => {
        failure = reason;
        const result = await runPublish(['--private']);
        expect(result.exitCode).toBe(1);
        expect(result.envelope.error.details).toMatchObject({
          phase: 'register',
          outcome: 'unknown',
          completedPhases: ['prepare-upload', 'upload'],
          fileId,
        });
        expect(server.requests).toHaveLength(3);
        expect(result.envelope.error.hint).toContain(
          'Check the server registry',
        );
        const invocations = await readInvocations();
        await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
      },
    );

    it('cancels a pending registration and preserves the uncertain outcome', async () => {
      failure = 'hold-complete';
      const controller = new AbortController();
      const pending = runAppPublishCommand({
        command: 'app publish',
        arguments: [],
        options: { path: appPath, private: true },
        outputMode: 'json',
        output: createOutput({ mode: 'json', command: 'app publish' }),
        signal: controller.signal,
      }).catch((error: unknown) => error);
      await expect.poll(() => server.requests.length).toBe(3);
      controller.abort();
      expect(await pending).toMatchObject({
        code: 'CANCELLED',
        details: { phase: 'register', outcome: 'unknown', fileId },
      });
      const invocations = await readInvocations();
      await expect(access(invocations[0].args.at(-1))).rejects.toThrow();
    });
  });
});
