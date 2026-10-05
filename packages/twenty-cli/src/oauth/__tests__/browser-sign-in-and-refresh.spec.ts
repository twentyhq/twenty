import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
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
import { type ConfigFile } from '@/config/types/config-file.type';
import { openBrowser } from '@/oauth/open-browser';
import { refreshOAuthSession } from '@/oauth/refresh-oauth-session';
import { startCallbackServer } from '@/oauth/start-callback-server';

vi.mock('@/oauth/open-browser', () => ({ openBrowser: vi.fn() }));

const CLIENT_ID = 'cli-client';

type Scenario = {
  isDeclined?: boolean;
  returnedState?: string;
  returnedIssuer?: string | null;
  advertisedIssuer?: string;
  tokenEndpointOrigin?: string;
  tokenEndpointPath?: string;
};

type ServerState = {
  scenario: Scenario;
  codeChallenge: string;
  isVerifierValid: boolean;
  codeExchanges: number;
  currentRefreshToken: string;
  refreshCalls: number;
  validAccessTokens: Set<string>;
};

type RefusalCase = {
  args?: string[];
  continuousIntegration?: string;
  isTerminal?: boolean;
};

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const createAccessToken = (expiresInSeconds: number, id: string) =>
  [
    encode({ alg: 'none' }),
    encode({ sub: id, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
    'signature',
  ].join('.');

const state: ServerState = {
  scenario: {},
  codeChallenge: '',
  isVerifierValid: false,
  codeExchanges: 0,
  currentRefreshToken: 'refresh-1',
  refreshCalls: 0,
  validAccessTokens: new Set<string>(),
};

const server = await startTestServer((request, response) => {
  const url = new URL(request.path, 'http://fake');

  if (url.pathname === '/.well-known/oauth-authorization-server') {
    return sendJson(response, 200, {
      issuer: state.scenario.advertisedIssuer ?? server.url,
      authorization_endpoint: `${server.url}/authorize`,
      token_endpoint: `${state.scenario.tokenEndpointOrigin ?? server.url}${state.scenario.tokenEndpointPath ?? '/oauth/token'}`,
      cli_client_id: CLIENT_ID,
      code_challenge_methods_supported: ['S256'],
      authorization_response_iss_parameter_supported: true,
    });
  }

  if (url.pathname === '/authorize') {
    const callback = new URL(url.searchParams.get('redirect_uri') ?? '');
    const {
      isDeclined,
      returnedState,
      returnedIssuer = server.url,
    } = state.scenario;

    state.codeChallenge = url.searchParams.get('code_challenge') ?? '';

    if (isDeclined === true) {
      callback.searchParams.set('error', 'access_denied');
    } else {
      callback.searchParams.set('code', 'authorization-code');
    }

    callback.searchParams.set(
      'state',
      returnedState ?? url.searchParams.get('state') ?? '',
    );

    if (isDefined(returnedIssuer)) {
      callback.searchParams.set('iss', returnedIssuer);
    }

    response.writeHead(302, { location: callback.href });

    return response.end();
  }

  if (url.pathname === (state.scenario.tokenEndpointPath ?? '/oauth/token')) {
    const parameters: unknown = JSON.parse(request.body);

    if (!isPlainObject(parameters)) {
      return sendJson(response, 400, { error: 'invalid_request' });
    }

    if (parameters.grant_type === 'authorization_code') {
      state.codeExchanges += 1;
      state.isVerifierValid =
        isString(parameters.code_verifier) &&
        createHash('sha256')
          .update(parameters.code_verifier)
          .digest('base64url') === state.codeChallenge;

      if (!state.isVerifierValid || parameters.client_id !== CLIENT_ID) {
        return sendJson(response, 400, { error: 'invalid_grant' });
      }
    } else {
      state.refreshCalls += 1;

      if (parameters.refresh_token !== state.currentRefreshToken) {
        return sendJson(response, 400, {
          error: 'invalid_grant',
          error_description: 'The refresh token is invalid.',
        });
      }
    }

    const accessToken = createAccessToken(3600, `access-${Math.random()}`);

    state.currentRefreshToken = `refresh-${state.refreshCalls + 2}`;
    state.validAccessTokens.add(accessToken);

    return sendJson(response, 200, {
      access_token: accessToken,
      refresh_token: state.currentRefreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    });
  }

  const bearerToken = request.headers.authorization?.replace('Bearer ', '');

  if (!state.validAccessTokens.has(bearerToken ?? '')) {
    return sendJson(response, 200, {
      errors: [
        { message: 'Token invalid.', extensions: { code: 'UNAUTHENTICATED' } },
      ],
      data: null,
    });
  }

  return sendJson(response, 200, {
    data: {
      currentWorkspace: { displayName: 'Cloud' },
      currentUser: { email: 'jane@acme.com' },
    },
  });
});

const runJson = async (args: string[]) => {
  const { stdout, exitCode } = await runCliForTest([...args, '--json']);

  return { envelope: parseSingleJsonLine(stdout), exitCode };
};

const signIn = (args: string[] = []) =>
  runCliForTest([
    'auth',
    'login',
    '--url',
    server.url,
    '--name',
    'cloud',
    ...args,
  ]);

const stubStandardInput = ({ isTerminal }: { isTerminal: boolean }) =>
  vi
    .spyOn(process, 'stdin', 'get')
    .mockReturnValue(createStandardInputStub({ isTerminal }));

const countListeningServers = () =>
  process
    .getActiveResourcesInfo()
    .filter((resource) => resource === 'TCPServerWrap').length;

describe('browser sign-in and session refresh', () => {
  let configPath: string;

  const readConfigFile = async (): Promise<ConfigFile> =>
    JSON.parse(await readFile(configPath, 'utf8'));

  const expectNothingSaved = () =>
    expect(readFile(configPath, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    });

  const writeSession = async (accessToken: string, refreshToken: string) => {
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(
      configPath,
      JSON.stringify({
        version: 1,
        defaultRemote: 'cloud',
        remotes: {
          cloud: {
            apiUrl: server.url,
            twentyCLIAccessToken: accessToken,
            twentyCLIRefreshToken: refreshToken,
            twentyCLIRegistrationClientId: CLIENT_ID,
          },
        },
      }),
    );
  };

  beforeEach(async () => {
    const home = await mkdtemp(join(tmpdir(), 'twenty-cli-oauth-'));

    configPath = join(home, '.twenty', 'config.json');
    vi.stubEnv('HOME', home);
    vi.stubEnv('CI', '');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    stubStandardInput({ isTerminal: true });
    Object.assign(state, {
      scenario: {},
      codeChallenge: '',
      isVerifierValid: false,
      codeExchanges: 0,
      currentRefreshToken: 'refresh-1',
      refreshCalls: 0,
    });
    vi.mocked(openBrowser).mockImplementation((url) => {
      fetch(url).catch(() => undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.mocked(openBrowser).mockReset();
  });

  afterAll(async () => {
    await server.close();
  });

  it('signs in with the browser using PKCE and saves the session', async () => {
    const { stdout, stderr, exitCode } = await signIn();

    expect(exitCode).toBe(0);
    expect(state.isVerifierValid).toBe(true);
    expect(stderr).toContain(
      `If nothing opens, visit: ${server.url}/authorize?`,
    );
    expect(stdout).toContain('jane@acme.com');

    const { remotes } = await readConfigFile();

    expect(remotes.cloud).toMatchObject({
      apiUrl: server.url,
      twentyCLIRefreshToken: 'refresh-2',
      twentyCLIRegistrationClientId: CLIENT_ID,
      workspaceName: 'Cloud',
    });
    expect(remotes.cloud).not.toHaveProperty('apiKey');
  });

  it.each<[string, Scenario, string]>([
    ['declines', { isDeclined: true }, 'Sign-in was declined in the browser.'],
    [
      'answers another login attempt',
      { returnedState: 'forged' },
      'The sign-in response does not match this login attempt.',
    ],
    [
      'answers for another server',
      { returnedIssuer: 'https://elsewhere.example.com' },
      `The sign-in response came from https://elsewhere.example.com instead of ${server.url}.`,
    ],
    [
      'answers without the issuer the server promised',
      { returnedIssuer: null },
      'The sign-in response does not say which server sent it.',
    ],
    [
      'declines without the issuer the server promised',
      { isDeclined: true, returnedIssuer: null },
      'The sign-in response does not say which server sent it.',
    ],
    [
      'declines another login attempt',
      { isDeclined: true, returnedState: 'forged' },
      'The sign-in response does not match this login attempt.',
    ],
  ])('saves nothing when the browser %s', async (_, scenario, message) => {
    state.scenario = scenario;

    const { stderr, exitCode } = await signIn();

    expect(exitCode).toBe(1);
    expect(stderr).toContain(message);
    expect(state.codeExchanges).toBe(0);
    await expectNothingSaved();
  });

  it.each<[string, Scenario, string]>([
    [
      'its token endpoint is on another server',
      { tokenEndpointOrigin: 'https://elsewhere.example.com' },
      'its token endpoint https://elsewhere.example.com is on another server.',
    ],
    [
      'it identifies itself as another server',
      { advertisedIssuer: 'https://foreign.example.com' },
      'it identifies itself as https://foreign.example.com.',
    ],
  ])('does not open the browser when %s', async (_, scenario, message) => {
    state.scenario = scenario;

    const { stderr, exitCode } = await signIn();

    expect(exitCode).toBe(1);
    expect(stderr).toContain(message);
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it.each<[string, RefusalCase]>([
    ['with --no-input', { args: ['--no-input'] }],
    ['with --json', { args: ['--json'] }],
    ['in CI', { continuousIntegration: 'true' }],
    ['when stdin is not a terminal', { isTerminal: false }],
  ])(
    'refuses browser sign-in %s',
    async (_, { args = [], continuousIntegration = '', isTerminal = true }) => {
      vi.stubEnv('CI', continuousIntegration);
      stubStandardInput({ isTerminal });

      const { stdout, stderr, exitCode } = await signIn(args);

      expect(exitCode).toBe(2);
      expect(`${stdout}${stderr}`).toContain(
        'Browser sign-in only runs in an interactive terminal',
      );
      expect(openBrowser).not.toHaveBeenCalled();
    },
  );

  it('stops waiting for the browser on Ctrl+C and closes the callback server', async () => {
    let authorizationUrl = '';

    vi.mocked(openBrowser).mockImplementation((url) => {
      authorizationUrl = url;
      setImmediate(() => process.emit('SIGINT'));
    });

    const { stderr, exitCode } = await signIn();
    const redirectUri = new URL(authorizationUrl).searchParams.get(
      'redirect_uri',
    );

    expect(exitCode).toBe(130);
    expect(stderr).toContain('Cancelled.');
    await expect(fetch(redirectUri ?? '')).rejects.toThrow();
    await expectNothingSaved();
  });

  it('does not leave a callback server listening when already cancelled', async () => {
    const listeningServersBefore = countListeningServers();

    await expect(
      startCallbackServer({
        state: 'state',
        issuer: server.url,
        isIssuerInResponse: true,
        signal: AbortSignal.abort(),
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    await vi.waitFor(() =>
      expect(countListeningServers()).toBe(listeningServersBefore),
    );
  });

  it.each(['/oauth/token', '/custom/token'])(
    'refreshes an expiring session at the advertised %s endpoint and keeps the rotated tokens',
    async (tokenEndpointPath) => {
      state.scenario = { tokenEndpointPath };
      await writeSession(createAccessToken(10, 'expiring'), 'refresh-1');

      const { envelope, exitCode } = await runJson(['auth', 'status']);
      const { remotes } = await readConfigFile();

      expect(exitCode).toBe(0);
      expect(envelope.data).toMatchObject({
        credentials: 'oauth',
        email: 'jane@acme.com',
      });
      expect(state.refreshCalls).toBe(1);
      expect(remotes.cloud.twentyCLIRefreshToken).toBe('refresh-3');
      expect(
        state.validAccessTokens.has(remotes.cloud.twentyCLIAccessToken ?? ''),
      ).toBe(true);
    },
  );

  it('rejects a foreign refresh endpoint without sending or changing credentials', async () => {
    state.scenario = { tokenEndpointOrigin: 'https://elsewhere.example.com' };
    await writeSession(createAccessToken(10, 'expiring'), 'refresh-1');

    const configBefore = await readConfigFile();
    const { envelope, exitCode } = await runJson(['auth', 'status']);

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({ code: 'OAUTH_UNAVAILABLE' });
    expect(state.refreshCalls).toBe(0);
    expect(await readConfigFile()).toEqual(configBefore);
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it('asks to sign in again when the refresh is rejected, without a browser', async () => {
    const expiredAccessToken = createAccessToken(-10, 'expired');

    await writeSession(expiredAccessToken, 'revoked-refresh-token');

    const { envelope, exitCode } = await runJson(['auth', 'status']);

    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'AUTH_REQUIRED',
      hint: 'Sign in again: twenty auth login --remote cloud',
    });
    expect(openBrowser).not.toHaveBeenCalled();
    expect((await readConfigFile()).remotes.cloud.twentyCLIAccessToken).toBe(
      expiredAccessToken,
    );
  });

  it('lets only one command refresh a session at a time', async () => {
    await writeSession(createAccessToken(10, 'expiring'), 'refresh-1');

    const refresh = () =>
      refreshOAuthSession({
        configPath,
        remoteName: 'cloud',
        apiUrl: server.url,
        signal: new AbortController().signal,
      });
    const [firstAccessToken, secondAccessToken] = await Promise.all([
      refresh(),
      refresh(),
    ]);

    expect(state.refreshCalls).toBe(1);
    expect(firstAccessToken).toBe(secondAccessToken);
  });

  describe('when the remote changes while a refresh waits for the lock', () => {
    const otherServerUrl = () => server.url.replace('127.0.0.1', 'localhost');

    const writeRemote = async (remote: Record<string, unknown>) => {
      await mkdir(dirname(configPath), { recursive: true });
      await writeFile(
        configPath,
        JSON.stringify({ version: 1, remotes: { cloud: remote } }),
      );
    };

    const refreshSelectedServer = () =>
      refreshOAuthSession({
        configPath,
        remoteName: 'cloud',
        apiUrl: server.url,
        signal: new AbortController().signal,
      });

    it.each([
      [
        'pointed at another server',
        () => ({
          apiUrl: otherServerUrl(),
          twentyCLIAccessToken: createAccessToken(10, 'other-server'),
          twentyCLIRefreshToken: 'refresh-1',
          twentyCLIRegistrationClientId: CLIENT_ID,
        }),
      ],
      [
        'switched to an API key',
        () => ({ apiUrl: server.url, apiKey: 'api-key' }),
      ],
    ])(
      'refuses when the remote was %s, and sends nothing',
      async (_, remote) => {
        await writeRemote(remote());

        await expect(refreshSelectedServer()).rejects.toMatchObject({
          code: 'CONFLICT',
          exitCode: 6,
        });
        expect(state.refreshCalls).toBe(0);
      },
    );

    it('refuses when the remote was removed', async () => {
      await mkdir(dirname(configPath), { recursive: true });
      await writeFile(configPath, JSON.stringify({ version: 1, remotes: {} }));

      await expect(refreshSelectedServer()).rejects.toMatchObject({
        code: 'CONFLICT',
      });
    });

    it('asks to sign in again when the remote was signed out', async () => {
      await writeRemote({ apiUrl: server.url });

      await expect(refreshSelectedServer()).rejects.toMatchObject({
        code: 'AUTH_REQUIRED',
        message: 'Remote cloud was signed out while this command was waiting.',
      });
    });

    it('uses a session signed in again on the same server', async () => {
      const freshAccessToken = createAccessToken(3600, 'signed-in-again');

      await writeRemote({
        apiUrl: server.url,
        twentyCLIAccessToken: freshAccessToken,
        twentyCLIRefreshToken: 'refresh-1',
        twentyCLIRegistrationClientId: CLIENT_ID,
      });

      await expect(refreshSelectedServer()).resolves.toBe(freshAccessToken);
      expect(state.refreshCalls).toBe(0);
    });
  });
});
