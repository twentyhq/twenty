import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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

import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import { runCliForTest } from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { confirmInTerminal } from '@/input/confirm-in-terminal';
import { signInWithBrowser } from '@/oauth/sign-in-with-browser';
import { type ConfigFile } from '@/config/types/config-file.type';

vi.mock('@/input/confirm-in-terminal', () => ({ confirmInTerminal: vi.fn() }));
vi.mock('@/oauth/sign-in-with-browser', () => ({ signInWithBrowser: vi.fn() }));

const state = {
  acceptsOldToken: false,
  rejectsNewToken: false,
  identityStatus: 401,
  refreshStatus: 400,
  graphqlError: '',
  operationStatus: 200,
};
const server = await startTestServer((request, response) => {
  if (request.path === '/.well-known/oauth-authorization-server') {
    sendJson(response, 200, {
      issuer: server.url,
      authorization_endpoint: `${server.url}/authorize`,
      token_endpoint: `${server.url}/oauth/token`,
      cli_client_id: 'old-client',
      code_challenge_methods_supported: ['S256'],
    });

    return;
  }

  if (request.path === '/oauth/token') {
    sendJson(response, state.refreshStatus, { error: 'invalid_grant' });

    return;
  }

  if (request.path === '/metadata') {
    const isNewToken = request.headers.authorization === 'Bearer new-session';

    if (
      (isNewToken && !state.rejectsNewToken) ||
      (!isNewToken && state.acceptsOldToken)
    ) {
      sendJson(response, 200, {
        data: {
          currentWorkspace: { displayName: 'Test workspace' },
          currentUser: { email: 'me@example.com' },
        },
      });
    } else if (state.graphqlError) {
      sendJson(response, 200, {
        errors: [
          {
            message: 'Session rejected',
            extensions: { code: state.graphqlError },
          },
        ],
      });
    } else {
      sendJson(response, state.identityStatus, { error: 'Session rejected' });
    }

    return;
  }

  sendJson(response, state.operationStatus, { result: 'command-result' });
});

const runMutation = (flags: string[] = []) =>
  runCliForTest([
    'api',
    'rest',
    '/rest/companies',
    '--method',
    'POST',
    '--body',
    '{"name":"New company"}',
    ...flags,
  ]);
const operationRequests = () =>
  server.requests.filter((request) => request.path === '/rest/companies');
const setTerminal = (isTerminal: boolean) =>
  vi
    .spyOn(process, 'stdin', 'get')
    .mockReturnValue(createStandardInputStub({ isTerminal }));

describe('interactive OAuth session recovery', () => {
  let home: string;
  let configPath: string;
  let initialConfig: ConfigFile;
  const readSaved = async (): Promise<ConfigFile> =>
    JSON.parse(await readFile(configPath, 'utf8'));
  const save = (config: ConfigFile) =>
    writeFile(configPath, JSON.stringify(config));

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'twenty-reauth-'));
    await mkdir(join(home, '.twenty'));
    configPath = join(home, '.twenty/config.json');
    initialConfig = {
      version: 1,
      defaultRemote: 'work',
      customSetting: 'keep-top-level',
      remotes: {
        work: {
          apiUrl: server.url,
          apiKey: 'stale-api-key',
          twentyCLIAccessToken: 'old-session',
          twentyCLIRefreshToken: 'old-refresh',
          twentyCLIRegistrationClientId: 'old-client',
          appRegistrationId: 'keep-registration',
          workspaceName: 'keep-workspace',
        },
        other: { apiUrl: 'https://other.example', apiKey: 'other-key' },
      },
    };
    await save(initialConfig);
    vi.stubEnv('HOME', home);
    vi.stubEnv('CI', '');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    setTerminal(true);
    vi.mocked(confirmInTerminal).mockResolvedValue(true);
    vi.mocked(signInWithBrowser).mockResolvedValue({
      accessToken: 'new-session',
      clientId: 'new-client',
    });
    Object.assign(state, {
      acceptsOldToken: false,
      rejectsNewToken: false,
      identityStatus: 401,
      refreshStatus: 400,
      graphqlError: '',
      operationStatus: 200,
    });
    server.requests.length = 0;
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.mocked(confirmInTerminal).mockReset();
    vi.mocked(signInWithBrowser).mockReset();
    await rm(home, { recursive: true, force: true });
  });

  afterAll(() => server.close());

  it.each(['http', 'graphql'])(
    'recovers a rejected session before executing a mutation (%s)',
    async (kind) => {
      if (kind === 'graphql') state.graphqlError = 'UNAUTHENTICATED';
      vi.mocked(confirmInTerminal).mockImplementation(async () => {
        expect(operationRequests()).toHaveLength(0);

        return true;
      });

      const result = await runMutation();

      expect(result.exitCode, result.stderr).toBe(0);
      expect(vi.mocked(confirmInTerminal)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(signInWithBrowser)).toHaveBeenCalledTimes(1);
      expect(operationRequests()).toHaveLength(1);
      expect(operationRequests()[0].headers.authorization).toBe(
        'Bearer new-session',
      );
      expect(await readSaved()).toEqual({
        ...initialConfig,
        remotes: {
          ...initialConfig.remotes,
          work: {
            apiUrl: server.url,
            twentyCLIAccessToken: 'new-session',
            twentyCLIRegistrationClientId: 'new-client',
            appRegistrationId: 'keep-registration',
            workspaceName: 'keep-workspace',
          },
        },
      });
    },
  );

  it('recovers a failed refresh before the command runs', async () => {
    const expiredToken = `header.${Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url')}.signature`;
    initialConfig.remotes.work.twentyCLIAccessToken = expiredToken;
    await save(initialConfig);

    const result = await runMutation();

    expect(result.exitCode, result.stderr).toBe(0);
    expect(server.requests.map((request) => request.path)).toContain(
      '/oauth/token',
    );
    expect(vi.mocked(signInWithBrowser)).toHaveBeenCalledTimes(1);
    expect(operationRequests()).toHaveLength(1);
    expect(operationRequests()[0].headers.authorization).toBe(
      'Bearer new-session',
    );
  });

  it.each([403, 503])(
    'does not turn refresh HTTP %s into a browser sign-in',
    async (status) => {
      initialConfig.remotes.work.twentyCLIAccessToken = `header.${Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url')}.signature`;
      await save(initialConfig);
      state.refreshStatus = status;

      expect((await runMutation()).exitCode).toBe(3);
      expect(confirmInTerminal).not.toHaveBeenCalled();
      expect(signInWithBrowser).not.toHaveBeenCalled();
      expect(operationRequests()).toHaveLength(0);
      expect(await readSaved()).toEqual(initialConfig);
    },
  );

  it.each([
    { name: 'JSON', flags: ['--json'], ci: '', terminal: true },
    { name: 'no input', flags: ['--no-input'], ci: '', terminal: true },
    { name: 'CI', flags: [], ci: 'true', terminal: true },
    { name: 'redirected stdin', flags: [], ci: '', terminal: false },
  ])('never prompts in $name mode', async ({ flags, ci, terminal }) => {
    vi.stubEnv('CI', ci);
    setTerminal(terminal);
    state.operationStatus = 401;

    const result = await runMutation(flags);

    expect(result.exitCode).toBe(3);
    expect(confirmInTerminal).not.toHaveBeenCalled();
    expect(signInWithBrowser).not.toHaveBeenCalled();
    expect(server.requests.map((request) => request.path)).toEqual([
      '/rest/companies',
    ]);
    expect(await readSaved()).toEqual(initialConfig);
  });

  it('does not offer browser login for an API key', async () => {
    initialConfig.remotes.work = { apiUrl: server.url, apiKey: 'api-key' };
    await save(initialConfig);
    state.operationStatus = 401;

    expect((await runMutation()).exitCode).toBe(3);
    expect(confirmInTerminal).not.toHaveBeenCalled();
    expect(signInWithBrowser).not.toHaveBeenCalled();
    expect(server.requests.map((request) => request.path)).toEqual([
      '/rest/companies',
    ]);
  });

  it('retains the login hint without saving or executing when sign-in is declined', async () => {
    vi.mocked(confirmInTerminal).mockResolvedValue(false);

    const result = await runMutation();

    expect(result.exitCode).toBe(3);
    expect(result.stderr).toContain('twenty auth login --remote work');
    expect(signInWithBrowser).not.toHaveBeenCalled();
    expect(operationRequests()).toHaveLength(0);
    expect(await readSaved()).toEqual(initialConfig);
  });

  it('does not prompt again or save a newly rejected session', async () => {
    state.rejectsNewToken = true;

    expect((await runMutation()).exitCode).toBe(3);
    expect(confirmInTerminal).toHaveBeenCalledTimes(1);
    expect(signInWithBrowser).toHaveBeenCalledTimes(1);
    expect(operationRequests()).toHaveLength(0);
    expect(await readSaved()).toEqual(initialConfig);
  });

  it.each(['FORBIDDEN', 'INTERNAL_SERVER_ERROR'])(
    'does not treat %s as an expired session',
    async (code) => {
      state.graphqlError = code;

      expect((await runMutation()).exitCode).not.toBe(0);
      expect(confirmInTerminal).not.toHaveBeenCalled();
      expect(signInWithBrowser).not.toHaveBeenCalled();
      expect(operationRequests()).toHaveLength(0);
    },
  );

  it('does not retry a mutation if authentication fails after the preflight', async () => {
    state.acceptsOldToken = true;
    state.operationStatus = 401;

    expect((await runMutation()).exitCode).toBe(3);
    expect(operationRequests()).toHaveLength(1);
    expect(confirmInTerminal).not.toHaveBeenCalled();
    expect(signInWithBrowser).not.toHaveBeenCalled();
  });

  it('does not restart a command when the replacement session later fails', async () => {
    state.operationStatus = 401;

    expect((await runMutation()).exitCode).toBe(3);
    expect(operationRequests()).toHaveLength(1);
    expect(confirmInTerminal).toHaveBeenCalledTimes(1);
    expect(signInWithBrowser).toHaveBeenCalledTimes(1);
  });

  it.each([
    'removed',
    'retargeted',
    'signed out',
    'API key',
    'another session',
  ])(
    'refuses to overwrite a remote changed during login: %s',
    async (change) => {
      vi.mocked(signInWithBrowser).mockImplementation(async () => {
        const config = await readSaved();
        if (change === 'removed') delete config.remotes.work;
        if (change === 'retargeted')
          config.remotes.work.apiUrl = 'https://another.example';
        if (change === 'signed out')
          config.remotes.work = { apiUrl: server.url };
        if (change === 'API key')
          config.remotes.work = {
            apiUrl: server.url,
            apiKey: 'replacement-key',
          };
        if (change === 'another session')
          config.remotes.work.twentyCLIAccessToken = 'concurrent-session';
        await save(config);
        initialConfig = config;

        return { accessToken: 'new-session', clientId: 'new-client' };
      });

      const result = await runMutation();

      expect(result.exitCode).toBe(6);
      expect(result.stderr).toContain('changed while signing in again');
      expect(operationRequests()).toHaveLength(0);
      expect(await readSaved()).toEqual(initialConfig);
    },
  );

  it('preserves unrelated configuration changes made during login', async () => {
    vi.mocked(signInWithBrowser).mockImplementation(async () => {
      const config = await readSaved();
      config.defaultRemote = 'other';
      config.remotes.work.appRegistrationId = 'new-registration';
      await save(config);

      return {
        accessToken: 'new-session',
        refreshToken: 'new-refresh',
        clientId: 'new-client',
      };
    });

    expect((await runMutation()).exitCode).toBe(0);
    const saved = await readSaved();

    expect(saved.defaultRemote).toBe('other');
    expect(saved.remotes.work.appRegistrationId).toBe('new-registration');
    expect(saved.remotes.work.twentyCLIRefreshToken).toBe('new-refresh');
  });

  it('cancels before the command if interrupted during sign-in', async () => {
    vi.mocked(signInWithBrowser).mockImplementation(async ({ signal }) => {
      process.emit('SIGINT');
      signal.throwIfAborted();

      return { accessToken: 'new-session', clientId: 'new-client' };
    });

    expect((await runMutation()).exitCode).toBe(130);
    expect(operationRequests()).toHaveLength(0);
    expect(await readSaved()).toEqual(initialConfig);
  });
});
