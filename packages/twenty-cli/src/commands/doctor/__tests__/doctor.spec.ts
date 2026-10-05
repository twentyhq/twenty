import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

vi.mock('@/transport/constants/request-timeout-milliseconds.constant', () => ({
  REQUEST_TIMEOUT_MILLISECONDS: 500,
}));

const API_KEY = 'doctor-test-secret-key';
const REFRESH_TOKEN = 'doctor-test-secret-refresh';

describe('doctor', () => {
  let root: string;
  let configPath: string;
  let servers: Awaited<ReturnType<typeof startTestServer>>[];

  const runJson = async (options: string[] = []) => {
    const result = await runCliForTest(['doctor', ...options, '--json']);
    const envelope = parseSingleJsonLine(result.stdout);

    return {
      ...result,
      envelope,
      checks: envelope.ok
        ? envelope.data.checks
        : envelope.error.details?.checks,
    };
  };

  const saveConfig = async (config: unknown) => {
    await mkdir(join(root, '.twenty'), { recursive: true });
    await writeFile(configPath, JSON.stringify(config));
  };

  const createApp = async (packageFields: Record<string, unknown> = {}) => {
    const appPath = join(root, 'app');
    const sdkPath = join(appPath, 'node_modules', 'twenty-sdk');

    await mkdir(sdkPath, { recursive: true });
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        name: 'doctor-app',
        devDependencies: { 'twenty-sdk': '9.9.9' },
      }),
    );
    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: 'twenty-sdk',
        version: '9.9.9',
        exports: {
          './define': './build.cjs',
          './front-component': './build.cjs',
        },
        ...packageFields,
      }),
    );
    await writeFile(
      join(sdkPath, 'build.cjs'),
      "throw new Error('Doctor must not import the SDK');",
    );

    return { appPath, sdkPath };
  };

  const startWorkspace = async (
    mode: 'success' | 'reject' | 'invalid' | 'hang' = 'success',
  ) => {
    const server = await startTestServer((request, response) => {
      if (mode === 'hang') {
        return;
      }

      if (mode === 'reject') {
        return sendJson(response, 200, {
          errors: [
            {
              message: `Rejected ${API_KEY} ${REFRESH_TOKEN}`,
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
          data: null,
        });
      }

      if (mode === 'invalid') {
        return sendJson(response, 200, { unexpected: API_KEY });
      }

      return sendJson(response, 200, {
        data: {
          currentWorkspace: { displayName: API_KEY },
          currentUser: { email: REFRESH_TOKEN },
        },
      });
    });

    servers.push(server);

    return server;
  };

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-doctor-'));
    configPath = join(root, '.twenty', 'config.json');
    servers = [];
    vi.stubEnv('HOME', root);
    vi.stubEnv('PATH', join(root, 'bin'));
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.spyOn(process, 'cwd').mockReturnValue(root);
  });

  afterEach(async () => {
    for (const server of servers) {
      await server.close();
    }

    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('works without an app or credentials and explains skipped checks', async () => {
    const result = await runJson();

    expect(result.exitCode).toBe(0);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'node', status: 'pass' }),
        expect.objectContaining({ id: 'cli', status: 'pass' }),
        expect.objectContaining({ id: 'project', status: 'skipped' }),
        expect.objectContaining({ id: 'metadata-api', status: 'skipped' }),
      ]),
    );
    await expect(readFile(configPath)).rejects.toMatchObject({
      code: 'ENOENT',
    });

    const human = await runCliForTest(['doctor']);

    expect(human.stdout).toContain('[SKIPPED] project:');
    expect(human.stdout).toContain('[PASS] node:');
  });

  it('checks public SDK exports without importing or requiring a build API', async () => {
    const { appPath } = await createApp();
    const result = await runJson(['--path', appPath]);

    expect(result.exitCode).toBe(0);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'sdk',
        status: 'pass',
        details: expect.objectContaining({
          version: '9.9.9',
        }),
      }),
    );
    await expect(
      readFile(join(appPath, '.twenty', 'output', 'manifest.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('collects broken config and missing SDK failures without exposing config contents', async () => {
    const { appPath, sdkPath } = await createApp();

    await rm(sdkPath, { recursive: true });
    await saveConfig({});
    const invalid = `{ ${API_KEY} ${REFRESH_TOKEN}`;

    await writeFile(configPath, invalid);
    const result = await runJson(['--path', appPath]);

    expect(result.exitCode).toBe(1);
    expect(result.envelope.error.code).toBe('DOCTOR_FAILED');
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sdk',
          status: 'fail',
          code: 'SDK_NOT_INSTALLED',
        }),
        expect.objectContaining({
          id: 'configuration',
          status: 'fail',
          message: expect.stringContaining('invalid JSON at line 1, column'),
        }),
      ]),
    );
    expect(result.stdout).not.toContain(API_KEY);
    expect(result.stdout).not.toContain(REFRESH_TOKEN);
    expect(await readFile(configPath, 'utf8')).toBe(invalid);

    const human = await runCliForTest(['doctor', '--path', appPath]);
    const [failureLine, ...checklistLines] = human.stderr.trimEnd().split('\n');

    expect(failureLine).toContain('doctor checks failed.');
    expect(checklistLines.filter((line) => !line.startsWith('  '))).toEqual([]);
    expect(human.stderr).toContain('\n  [FAIL] sdk:');
    expect(human.stderr).toContain('\n  [FAIL] configuration:');
    expect(human.stderr).not.toContain(API_KEY);
  });

  it('explains unsupported authoring SDK versions', async () => {
    const { appPath } = await createApp({ version: '1.22.0' });
    const result = await runJson(['--path', appPath]);

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'sdk',
        status: 'fail',
        code: 'SDK_SOURCE_UNSUPPORTED',
        hint: 'Install a compatible twenty-sdk version in this app.',
      }),
    );
  });

  it('does not warn about a missing SDK build API or project-local CLI', async () => {
    const { appPath } = await createApp();
    const result = await runJson(['--path', appPath]);

    expect(result.exitCode).toBe(0);
    expect(result.checks).not.toContainEqual(
      expect.objectContaining({ id: 'sdk-capabilities' }),
    );
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'cli',
        status: 'pass',
        details: expect.objectContaining({
          entryPoint: process.argv[1],
          nodeExecutable: process.execPath,
          version: expect.any(String),
        }),
      }),
    );
  });

  it('reports an unknown explicit remote while retaining the local checks', async () => {
    const result = await runJson(['--remote', 'missing']);

    expect(result.exitCode).toBe(1);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cli', status: 'pass' }),
        expect.objectContaining({
          id: 'target',
          status: 'fail',
          code: 'UNKNOWN_REMOTE',
        }),
      ]),
    );
  });

  it('warns about shared config permissions without changing them', async () => {
    await saveConfig({ version: 1, remotes: {} });
    await chmod(configPath, 0o644);
    const result = await runJson(['--offline']);

    expect(result.exitCode).toBe(0);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'configuration-permissions',
        status: 'warning',
      }),
    );
    const again = await runJson(['--offline']);

    expect(again.checks).toContainEqual(
      expect.objectContaining({
        id: 'configuration-permissions',
        status: 'warning',
      }),
    );
  });

  it('reports an incompatible SDK Node requirement', async () => {
    const { appPath } = await createApp({ engines: { node: '>=99.0.0' } });
    const result = await runJson(['--path', appPath]);

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'sdk',
        status: 'fail',
        code: 'NODE_VERSION_UNSUPPORTED',
      }),
    );
  });

  it('still checks the workspace when an explicit app path is invalid', async () => {
    const server = await startWorkspace();

    vi.stubEnv('TWENTY_API_URL', `${server.url}/prefix`);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson(['--path', join(root, 'missing')]);

    expect(result.exitCode).toBe(1);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'project', status: 'fail' }),
        expect.objectContaining({ id: 'metadata-api', status: 'pass' }),
      ]),
    );
    expect(server.requests).toHaveLength(1);
    expect(server.requests[0].path).toBe('/prefix/metadata');
    expect(server.requests[0].headers.authorization).toBe(`Bearer ${API_KEY}`);
    expect(result.stdout).not.toContain(API_KEY);
    expect(result.stdout).not.toContain(REFRESH_TOKEN);
  });

  it.each(['reject', 'invalid'] as const)(
    'redacts a %s server response',
    async (mode) => {
      const server = await startWorkspace(mode);

      vi.stubEnv('TWENTY_API_URL', server.url);
      vi.stubEnv('TWENTY_API_KEY', API_KEY);
      const result = await runJson();

      expect(result.exitCode).toBe(1);
      expect(result.checks).toContainEqual(
        expect.objectContaining({ id: 'metadata-api', status: 'fail' }),
      );
      expect(result.stdout).not.toContain(API_KEY);
      expect(result.stdout).not.toContain(REFRESH_TOKEN);

      if (mode === 'reject') {
        expect(result.checks).toContainEqual(
          expect.objectContaining({
            id: 'metadata-api',
            hint: 'Check TWENTY_API_KEY.',
          }),
        );
      }

      const human = await runCliForTest(['doctor']);

      expect(human.stderr).toContain('[FAIL] metadata-api:');
      expect(human.stdout + human.stderr).not.toContain(API_KEY);
      expect(human.stdout + human.stderr).not.toContain(REFRESH_TOKEN);
    },
  );

  it.each(['apiKey', 'oauth'] as const)(
    'gives the correct sign-in command for rejected %s credentials',
    async (credentialKind) => {
      const server = await startWorkspace('reject');
      const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.signature`;

      await saveConfig({
        version: 1,
        remotes: {
          staging: {
            apiUrl: server.url,
            ...(credentialKind === 'apiKey'
              ? { apiKey: API_KEY }
              : {
                  twentyCLIAccessToken: token,
                  twentyCLIRefreshToken: REFRESH_TOKEN,
                }),
          },
        },
      });
      const result = await runJson(['--remote', 'staging']);

      expect(result.exitCode).toBe(1);
      expect(result.checks).toContainEqual(
        expect.objectContaining({
          id: 'metadata-api',
          code: 'AUTH_REQUIRED',
          hint: `Sign in again: twenty auth login --remote staging${credentialKind === 'apiKey' ? ' --with-token' : ''}`,
        }),
      );
      expect(server.requests).toHaveLength(1);
      expect(result.stdout).not.toContain(token);
      expect(result.stdout).not.toContain(REFRESH_TOKEN);
    },
  );

  it.each([
    ['ENOTFOUND', 'DNS could not resolve'],
    ['ECONNREFUSED', 'refused the connection'],
    ['CERT_HAS_EXPIRED', 'TLS certificate has expired'],
    [API_KEY, 'Could not connect'],
  ])(
    'explains network error %s without exposing arbitrary error text',
    async (networkCode, expectedMessage) => {
      vi.stubEnv('TWENTY_API_URL', 'https://example.invalid');
      vi.stubEnv('TWENTY_API_KEY', API_KEY);
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new TypeError('fetch failed', {
          cause: Object.assign(new Error(`Failure ${API_KEY}`), {
            code: networkCode,
          }),
        }),
      );
      const result = await runJson();

      expect(result.exitCode).toBe(1);
      expect(result.checks).toContainEqual(
        expect.objectContaining({
          id: 'metadata-api',
          code: 'NETWORK_ERROR',
          message: expect.stringContaining(expectedMessage),
        }),
      );
      expect(result.stdout).not.toContain(API_KEY);
      const human = await runCliForTest(['doctor']);

      expect(human.stderr).toContain(expectedMessage);
      expect(human.stdout + human.stderr).not.toContain(API_KEY);
    },
  );

  it('does not make network requests in offline mode', async () => {
    vi.stubEnv('TWENTY_API_URL', 'https://example.invalid');
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await runJson(['--offline']);

    expect(result.exitCode).toBe(0);
    expect(result.checks).toContainEqual(
      expect.objectContaining({ id: 'metadata-api', status: 'skipped' }),
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('diagnoses a stopped local server through the real fetch transport', async () => {
    const server = await startWorkspace();
    const url = new URL(server.url);

    url.hostname = 'localhost';
    await server.close();
    vi.stubEnv('TWENTY_API_URL', url.href);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'metadata-api',
        code: 'NETWORK_ERROR',
        message: 'The metadata endpoint refused the connection.',
        details: { networkCode: 'ECONNREFUSED' },
      }),
    );
    expect(result.stdout).not.toContain(API_KEY);
  });

  it('does not forward credentials across a redirect', async () => {
    const destination = await startWorkspace();
    const redirect = await startTestServer((_request, response) => {
      response.writeHead(302, { location: `${destination.url}/metadata` });
      response.end();
    });

    servers.push(redirect);
    vi.stubEnv('TWENTY_API_URL', redirect.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'metadata-api',
        status: 'fail',
        code: 'REDIRECT_NOT_FOLLOWED',
      }),
    );
    expect(destination.requests).toHaveLength(0);
    expect(result.stdout).not.toContain(API_KEY);
  });

  it('keeps failed JSON diagnostics free of ANSI even when color is forced', async () => {
    vi.stubEnv('FORCE_COLOR', '1');
    const result = await runJson(['--remote', 'missing']);

    expect(result.exitCode).toBe(1);
    expect(JSON.stringify(result.envelope)).not.toContain('\\u001b');
    expect(result.stderr).toBe('');
  });

  it('does not echo credentials reflected in a redirect hostname', async () => {
    const redirect = await startTestServer((_request, response) => {
      response.writeHead(302, {
        location: `https://${API_KEY}.example.test/metadata`,
      });
      response.end();
    });

    servers.push(redirect);
    vi.stubEnv('TWENTY_API_URL', redirect.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'metadata-api',
        code: 'REDIRECT_NOT_FOLLOWED',
      }),
    );
    expect(result.stdout).not.toContain(API_KEY);
    const human = await runCliForTest(['doctor']);

    expect(human.stdout + human.stderr).not.toContain(API_KEY);
  });

  it.each([true, false])(
    'reports expired OAuth credentials without refreshing (saved refresh token: %s)',
    async (hasRefreshToken) => {
      const server = await startWorkspace();
      const token = `header.${Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url')}.signature`;
      const config = {
        version: 1,
        defaultRemote: 'prod',
        remotes: {
          prod: {
            apiUrl: server.url,
            twentyCLIAccessToken: token,
            twentyCLIRefreshToken: hasRefreshToken ? REFRESH_TOKEN : undefined,
            apiKey: API_KEY,
          },
        },
      };

      await saveConfig(config);
      const result = await runJson();

      expect(result.exitCode).toBe(hasRefreshToken ? 0 : 1);
      expect(result.checks).toContainEqual(
        expect.objectContaining({
          id: 'credentials',
          status: hasRefreshToken ? 'warning' : 'fail',
          code: 'AUTH_REQUIRED',
        }),
      );
      expect(server.requests).toHaveLength(0);
      expect(result.stdout).not.toContain(token);
      expect(result.stdout).not.toContain(REFRESH_TOKEN);
      expect(await readFile(configPath, 'utf8')).toBe(JSON.stringify(config));
    },
  );

  it('uses an unexpired OAuth token without refreshing it or printing user information', async () => {
    const server = await startWorkspace();
    const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 30 })).toString('base64url')}.signature`;
    const config = {
      version: 1,
      defaultRemote: 'prod',
      remotes: {
        prod: {
          apiUrl: server.url,
          twentyCLIAccessToken: token,
          twentyCLIRefreshToken: REFRESH_TOKEN,
        },
      },
    };

    await saveConfig(config);
    const result = await runJson();

    expect(result.exitCode).toBe(0);
    expect(server.requests).toHaveLength(1);
    expect(server.requests[0].headers.authorization).toBe(`Bearer ${token}`);
    expect(result.stdout).not.toContain(token);
    expect(result.stdout).not.toContain(REFRESH_TOKEN);
    expect(await readFile(configPath, 'utf8')).toBe(JSON.stringify(config));
  });

  it('keeps explicit remote precedence without mixing environment credentials', async () => {
    const server = await startWorkspace();

    await saveConfig({
      version: 1,
      remotes: { staging: { apiUrl: server.url, apiKey: API_KEY } },
    });
    vi.stubEnv('TWENTY_API_URL', 'https://wrong.invalid');
    vi.stubEnv('TWENTY_API_KEY', 'other-secret');
    const result = await runJson(['--remote', 'staging']);

    expect(result.exitCode).toBe(0);
    expect(result.checks).toContainEqual(
      expect.objectContaining({ id: 'target-precedence', status: 'warning' }),
    );
    expect(server.requests[0].headers.authorization).toBe(`Bearer ${API_KEY}`);
    expect(result.stdout).not.toContain('other-secret');
  });

  it('reports incomplete environment credentials instead of falling back', async () => {
    const server = await startWorkspace();

    await saveConfig({
      version: 1,
      defaultRemote: 'prod',
      remotes: { prod: { apiUrl: server.url, apiKey: API_KEY } },
    });
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'target',
        status: 'fail',
        code: 'INCOMPLETE_TARGET',
      }),
    );
    expect(server.requests).toHaveLength(0);
  });

  it('detects a legacy SDK owning the PATH executable without executing it', async () => {
    const sdkPath = join(root, 'legacy', 'twenty-sdk');
    const binPath = join(root, 'bin');
    const executable = join(sdkPath, 'cli.cjs');

    await mkdir(sdkPath, { recursive: true });
    await mkdir(binPath);
    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: 'twenty-sdk',
        version: '2.13.0',
        bin: { twenty: 'cli.cjs' },
      }),
    );
    await writeFile(
      executable,
      "#!/usr/bin/env node\nthrow new Error('Must not execute PATH binaries');\n",
    );
    await chmod(executable, 0o755);
    await symlink(executable, join(binPath, 'twenty'));
    const result = await runJson(['--offline']);

    expect(result.exitCode).toBe(0);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'path',
        status: 'warning',
        details: {
          candidates: [
            expect.objectContaining({
              owner: { name: 'twenty-sdk', version: '2.13.0' },
            }),
          ],
        },
      }),
    );
  });

  it('does not assign package ownership to an unrelated wrapper', async () => {
    await mkdir(join(root, 'bin'));
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        name: 'twenty-sdk',
        version: '2.13.0',
        bin: { twenty: 'other.cjs' },
      }),
    );
    const executable = join(root, 'bin', 'twenty');

    await writeFile(executable, '#!/bin/sh\nexit 10\n');
    await chmod(executable, 0o755);
    const result = await runJson(['--offline']);

    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'path',
        status: 'warning',
        details: expect.objectContaining({
          candidates: [expect.objectContaining({ owner: null })],
        }),
      }),
    );
  });

  it('warns when another CLI installation shadows the running one', async () => {
    const installedPath = join(root, 'other-cli');
    const runningPath = join(root, 'running-cli.cjs');
    const executable = join(installedPath, 'cli.cjs');
    const entryPoint = process.argv[1];

    await mkdir(installedPath);
    await mkdir(join(root, 'bin'));
    await writeFile(
      join(installedPath, 'package.json'),
      JSON.stringify({ name: 'twenty', version: '0.1.0', bin: 'cli.cjs' }),
    );
    await writeFile(executable, '#!/usr/bin/env node\n');
    await writeFile(runningPath, '#!/usr/bin/env node\n');
    await chmod(executable, 0o755);
    await symlink(executable, join(root, 'bin', 'twenty'));
    process.argv[1] = runningPath;

    try {
      const result = await runJson(['--offline']);

      expect(result.exitCode).toBe(0);
      expect(result.checks).toContainEqual(
        expect.objectContaining({
          id: 'path',
          status: 'warning',
          message: expect.stringContaining('differs from the running CLI'),
        }),
      );
    } finally {
      process.argv[1] = entryPoint;
    }
  });

  it('bounds a stalled connection check', async () => {
    const server = await startWorkspace('hang');

    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: 'metadata-api',
        status: 'fail',
        code: 'TIMEOUT',
      }),
    );
  });

  it('cancels an in-flight check with the standard cancellation result', async () => {
    const server = await startWorkspace('hang');

    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    const run = runJson();

    await vi.waitFor(() => expect(server.requests).toHaveLength(1));
    process.emit('SIGINT');
    const result = await run;

    expect(result.exitCode).toBe(130);
    expect(result.envelope.error.code).toBe('CANCELLED');
  });
});
