import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const VALID_KEY = 'valid-key';

const server = await startTestServer((request, response) => {
  if (request.headers.authorization !== `Bearer ${VALID_KEY}`) {
    return sendJson(response, 200, {
      errors: [
        { message: 'Token invalid.', extensions: { code: 'UNAUTHENTICATED' } },
      ],
      data: null,
    });
  }

  return sendJson(response, 200, {
    data: { currentWorkspace: { displayName: 'Acme' } },
  });
});

const secondServerUrl = server.url.replace('127.0.0.1', 'localhost');

const runJson = async (args: string[]) => {
  const { stdout, exitCode } = await runCliForTest([...args, '--json']);

  return { envelope: parseSingleJsonLine(stdout), exitCode };
};

const login = (args: string[], apiKey = VALID_KEY) => {
  vi.spyOn(process, 'stdin', 'get').mockReturnValue(
    createStandardInputStub({ content: `${apiKey}\n` }),
  );

  return runJson(['auth', 'login', '--with-token', ...args]);
};

describe('auth and remote commands', () => {
  let configPath: string;

  const readConfigFile = async () =>
    JSON.parse(await readFile(configPath, 'utf8'));

  beforeEach(async () => {
    const home = await mkdtemp(join(tmpdir(), 'twenty-cli-home-'));

    configPath = join(home, '.twenty', 'config.json');
    vi.stubEnv('HOME', home);
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_REMOTE', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await server.close();
  });

  it('checks an API key read from stdin and saves the first remote as default', async () => {
    const { envelope, exitCode } = await login([
      '--url',
      server.url,
      '--name',
      'prod',
    ]);

    expect(exitCode).toBe(0);
    expect(envelope.data).toEqual({
      remote: 'prod',
      apiUrl: server.url,
      credentials: 'apiKey',
      workspaceName: 'Acme',
      email: null,
      isDefault: true,
    });
    expect(await readConfigFile()).toEqual({
      version: 1,
      defaultRemote: 'prod',
      remotes: {
        prod: { apiUrl: server.url, apiKey: VALID_KEY, workspaceName: 'Acme' },
      },
    });
  });

  it('saves an unnamed connection as default and reuses its URL on the next login', async () => {
    const first = await login(['--url', server.url]);
    const again = await login([]);

    expect(first.exitCode).toBe(0);
    expect(first.envelope.data).toMatchObject({
      remote: 'default',
      isDefault: true,
    });
    expect(again.exitCode).toBe(0);
    expect(again.envelope.data).toEqual(first.envelope.data);
    expect(await readConfigFile()).toMatchObject({
      defaultRemote: 'default',
      remotes: { default: { apiUrl: server.url, apiKey: VALID_KEY } },
    });
  });

  it('asks for a URL when no connections have been saved', async () => {
    const { envelope, exitCode } = await runJson(['auth', 'login']);

    expect(exitCode).toBe(2);
    expect(envelope.error).toMatchObject({
      code: 'USAGE',
      message: 'No saved connections yet.',
      hint: 'Run twenty auth login --url <url> to save a connection.',
    });
    await expect(readFile(configPath)).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('keeps a selected named remote and protects the unnamed connection from URL replacement', async () => {
    await login(['--url', server.url, '--name', 'prod']);
    const unnamed = await login(['--url', server.url]);
    const refused = await login(['--url', secondServerUrl]);

    expect(unnamed.envelope.data).toMatchObject({
      remote: 'default',
      isDefault: false,
    });
    expect(refused.exitCode).toBe(2);
    expect(refused.envelope.error.code).toBe('CONFIRMATION_REQUIRED');
    expect(await readConfigFile()).toMatchObject({
      defaultRemote: 'prod',
      remotes: {
        prod: { apiUrl: server.url },
        default: { apiUrl: server.url },
      },
    });
  });

  it('saves nothing when the server rejects the key', async () => {
    const { envelope, exitCode } = await login(
      ['--url', server.url, '--name', 'prod'],
      'wrong-key',
    );

    expect(exitCode).toBe(3);
    expect(envelope.error.code).toBe('AUTH_REQUIRED');
    expect(envelope.error.message).toContain('Nothing was saved');
    await expect(readFile(configPath, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('asks for --replace before pointing a remote at another URL', async () => {
    await login(['--url', server.url, '--name', 'prod']);

    const refused = await login(['--url', secondServerUrl, '--name', 'prod']);
    const replaced = await login([
      '--url',
      secondServerUrl,
      '--name',
      'prod',
      '--replace',
    ]);

    expect(refused.exitCode).toBe(2);
    expect(refused.envelope.error.code).toBe('CONFIRMATION_REQUIRED');
    expect(replaced.exitCode).toBe(0);
    expect((await readConfigFile()).remotes.prod.apiUrl).toBe(secondServerUrl);
  });

  it('lists, switches, renames and removes remotes', async () => {
    await login(['--url', server.url, '--name', 'prod']);
    await login(['--url', server.url, '--name', 'staging']);

    const listed = await runJson(['remote', 'list']);

    expect(listed.envelope.data).toEqual({
      defaultRemote: 'prod',
      remotes: [
        {
          name: 'prod',
          apiUrl: server.url,
          credentials: 'apiKey',
          workspaceName: 'Acme',
          isDefault: true,
        },
        {
          name: 'staging',
          apiUrl: server.url,
          credentials: 'apiKey',
          workspaceName: 'Acme',
          isDefault: false,
        },
      ],
    });

    await runJson(['remote', 'use', 'staging']);
    await runJson(['remote', 'rename', 'staging', 'preprod']);
    expect((await readConfigFile()).defaultRemote).toBe('preprod');

    const clash = await runJson(['remote', 'rename', 'preprod', 'prod']);

    expect(clash.envelope.error.code).toBe('REMOTE_EXISTS');

    const removed = await runJson(['remote', 'remove', 'preprod']);

    expect(removed.envelope.data).toEqual({
      removed: 'preprod',
      wasDefault: true,
    });
    expect(await readConfigFile()).not.toHaveProperty('defaultRemote');

    const unknown = await runJson(['remote', 'use', 'preprod']);

    expect(unknown.exitCode).toBe(2);
    expect(unknown.envelope.error.code).toBe('UNKNOWN_REMOTE');
  });

  it('reports status and prints the token of the default remote', async () => {
    await login(['--url', server.url, '--name', 'prod']);

    const status = await runJson(['auth', 'status']);
    const token = await runJson(['auth', 'token']);

    expect(status.envelope).toMatchObject({
      target: { remote: 'prod', apiUrl: server.url, source: 'remote' },
      data: {
        remote: 'prod',
        isDefaultRemote: true,
        credentials: 'apiKey',
        workspaceName: 'Acme',
      },
    });
    expect(token.envelope.data).toEqual({
      token: VALID_KEY,
      credentials: 'apiKey',
    });
  });

  it('lets --remote win over environment credentials with a warning', async () => {
    await login(['--url', server.url, '--name', 'prod']);
    vi.stubEnv('TWENTY_API_URL', 'https://other.example.com');
    vi.stubEnv('TWENTY_API_KEY', 'other-key');

    const { envelope } = await runJson(['auth', 'status', '--remote', 'prod']);

    expect(envelope.target.remote).toBe('prod');
    expect(envelope.warnings).toEqual([
      expect.objectContaining({ code: 'ENVIRONMENT_TARGET_IGNORED' }),
    ]);
  });

  it('signs out of a remote and keeps it', async () => {
    await login(['--url', server.url, '--name', 'prod']);

    const loggedOut = await runJson(['auth', 'logout']);
    const status = await runJson(['auth', 'status']);
    const loggedOutAgain = await runJson(['auth', 'logout']);

    expect(loggedOut.envelope.data).toEqual({
      remote: 'prod',
      wasSignedIn: true,
    });
    expect(status.exitCode).toBe(3);
    expect(status.envelope.error.code).toBe('AUTH_REQUIRED');
    expect(loggedOutAgain.envelope.data.wasSignedIn).toBe(false);
    expect((await readConfigFile()).remotes.prod).toEqual({
      apiUrl: server.url,
      workspaceName: 'Acme',
    });
  });

  it('refuses to sign out of environment credentials', async () => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', VALID_KEY);

    const { envelope, exitCode } = await runJson(['auth', 'logout']);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('USAGE');
  });
});
