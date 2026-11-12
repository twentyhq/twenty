import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';
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
import { createAppWorkerEnvironment } from '@/app/create-app-worker-environment';
import { putUploadFile } from '@/app/deployment/put-upload-file';
import { createProxyHeaders } from '@/proxy-headers/create-proxy-headers';
import { createBoundedFetch } from '@/transport/create-target-fetch';

const API_KEY = 'valid-key';

const PROXY_SIGN_IN_URL =
  'https://team.cloudflareaccess.com/cdn-cgi/access/login/twenty.example.com';

const proxy = { acceptedToken: 'proxy-token' };

const server = await startTestServer((request, response) => {
  if (request.headers['cf-access-token'] !== proxy.acceptedToken) {
    response.writeHead(302, { location: PROXY_SIGN_IN_URL });

    return response.end();
  }

  return sendJson(response, 200, {
    data: { currentWorkspace: { displayName: 'Acme' } },
  });
});

const otherServerUrl = server.url.replace('127.0.0.1', 'localhost');

const quoteForShell = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

const createNodeCommand = (script: string, ...args: string[]) =>
  [process.execPath, '-e', script, ...args].map(quoteForShell).join(' ');

const COUNTING_TOKEN_SCRIPT = `
const fs = require('node:fs');
const counterPath = process.argv[1];
const runs = (fs.existsSync(counterPath) ? Number(fs.readFileSync(counterPath, 'utf8')) : 0) + 1;
fs.writeFileSync(counterPath, String(runs));
console.log('cf-access-token: token-' + runs);
`;

const runJson = async (args: string[]) => {
  const { stdout, exitCode } = await runCliForTest([...args, '--json']);

  return { stdout, envelope: parseSingleJsonLine(stdout), exitCode };
};

const login = (args: string[]) => {
  vi.spyOn(process, 'stdin', 'get').mockReturnValue(
    createStandardInputStub({ content: `${API_KEY}\n` }),
  );

  return runJson(['auth', 'login', '--with-token', ...args]);
};

const readWorkspace = () =>
  runJson([
    'api',
    'graphql',
    '--metadata',
    '--query',
    '{ currentWorkspace { displayName } }',
  ]);

describe('proxy headers', () => {
  let home: string;

  const readConfigFile = async () =>
    JSON.parse(await readFile(join(home, '.twenty', 'config.json'), 'utf8'));

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'twenty-cli-home-'));
    proxy.acceptedToken = 'proxy-token';
    server.requests.length = 0;
    vi.stubEnv('HOME', home);
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('TWENTY_PROXY_HEADERS', '');
    vi.stubEnv('TWENTY_PROXY_HEADER_COMMAND', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await server.close();
  });

  it('explains a redirect to a proxy sign-in page instead of suggesting it as the API URL', async () => {
    const { envelope, exitCode } = await login(['--url', server.url]);

    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'PROXY_AUTH_REQUIRED',
      details: { redirectOrigin: 'https://team.cloudflareaccess.com' },
    });
    expect(envelope.error.hint).toContain('--proxy-header');
  });

  it('saves headers given at login and sends them on later requests', async () => {
    const saved = await login([
      '--url',
      server.url,
      '--proxy-header',
      `CF-Access-Token: ${proxy.acceptedToken}`,
    ]);

    expect(saved.exitCode).toBe(0);
    expect((await readConfigFile()).remotes.default.proxyHeaders).toEqual({
      'cf-access-token': proxy.acceptedToken,
    });

    const { stdout, envelope, exitCode } = await readWorkspace();

    expect(exitCode).toBe(0);
    expect(envelope.data).toEqual({
      currentWorkspace: { displayName: 'Acme' },
    });
    expect(stdout).not.toContain(proxy.acceptedToken);
    expect(server.requests.at(-1)?.headers.authorization).toBe(
      `Bearer ${API_KEY}`,
    );
  });

  it('reads headers from TWENTY_PROXY_HEADERS for an environment target', async () => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    vi.stubEnv(
      'TWENTY_PROXY_HEADERS',
      `cf-access-token: ${proxy.acceptedToken}\nx-team: platform\n`,
    );

    const { exitCode } = await readWorkspace();

    expect(exitCode).toBe(0);
    expect(server.requests.at(-1)?.headers).toMatchObject({
      'cf-access-token': proxy.acceptedToken,
      'x-team': 'platform',
    });
  });

  it('reruns the header command once when the proxy rejects its headers', async () => {
    const counterPath = join(home, 'header-command-runs');

    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    vi.stubEnv(
      'TWENTY_PROXY_HEADER_COMMAND',
      createNodeCommand(COUNTING_TOKEN_SCRIPT, counterPath),
    );
    proxy.acceptedToken = 'token-2';

    const { exitCode } = await readWorkspace();

    expect(exitCode).toBe(0);
    expect(await readFile(counterPath, 'utf8')).toBe('2');
    expect(
      server.requests.map((request) => request.headers['cf-access-token']),
    ).toEqual(['token-1', 'token-2']);
  });

  it('reports a failing header command without echoing what it printed', async () => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', API_KEY);
    vi.stubEnv(
      'TWENTY_PROXY_HEADER_COMMAND',
      createNodeCommand(
        "console.log('cf-access-token: leaked-secret'); console.error('Run cloudflared access login first.'); process.exit(4);",
      ),
    );

    const { stdout, envelope, exitCode } = await readWorkspace();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'PROXY_HEADERS_FAILED',
      details: {
        exitCode: 4,
        stderr: 'Run cloudflared access login first.',
      },
    });
    expect(stdout).not.toContain('leaked-secret');
    expect(server.requests).toEqual([]);
  });

  it('refuses headers the CLI sets itself', async () => {
    const { envelope, exitCode } = await login([
      '--url',
      server.url,
      '--proxy-header',
      'Authorization: Bearer other',
    ]);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('INVALID_INPUT');
    expect(server.requests).toEqual([]);
  });

  it('refuses header values HTTP cannot carry before sending anything', async () => {
    const { envelope, exitCode } = await login([
      '--url',
      server.url,
      '--proxy-header',
      'cf-access-token: \u201cpasted-token\u201d',
    ]);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('INVALID_INPUT');
    expect(envelope.error.message).not.toContain('pasted-token');
    expect(server.requests).toEqual([]);
  });

  it('does not carry saved headers over when a remote moves to another server', async () => {
    await login([
      '--url',
      server.url,
      '--proxy-header',
      `cf-access-token: ${proxy.acceptedToken}`,
    ]);
    server.requests.length = 0;

    const { envelope } = await login(['--url', otherServerUrl, '--replace']);

    expect(envelope.error.code).toBe('PROXY_AUTH_REQUIRED');
    expect(server.requests).toHaveLength(1);
    expect(server.requests[0].headers['cf-access-token']).toBeUndefined();
    expect((await readConfigFile()).remotes.default.proxyHeaders).toEqual({
      'cf-access-token': proxy.acceptedToken,
    });
  });

  it('saves a header command and clears it when given an empty value', async () => {
    await login([
      '--url',
      server.url,
      '--proxy-header-command',
      `echo "cf-access-token: ${proxy.acceptedToken}"`,
    ]);

    expect((await readConfigFile()).remotes.default.proxyHeaderCommand).toBe(
      `echo "cf-access-token: ${proxy.acceptedToken}"`,
    );

    await login([
      '--proxy-header-command',
      '',
      '--proxy-header',
      `cf-access-token: ${proxy.acceptedToken}`,
    ]);

    const remote = (await readConfigFile()).remotes.default;

    expect(remote.proxyHeaderCommand).toBeUndefined();
    expect(remote.proxyHeaders).toEqual({
      'cf-access-token': proxy.acceptedToken,
    });
  });

  it('never sends proxy headers outside the API URL', async () => {
    const read = vi.fn(async () => ({ 'cf-access-token': 'secret' }));
    const request = createBoundedFetch({
      apiUrl: 'https://twenty.example.com',
      proxyHeaders: { read, isRenewable: false, renew: () => {} },
      signal: new AbortController().signal,
    });

    await expect(
      request('https://uploads.example.com/file'),
    ).rejects.toMatchObject({ code: 'INVALID_REQUEST_PATH' });
    expect(read).not.toHaveBeenCalled();
  });

  it('sends proxy headers with uploads to the API host only', async () => {
    const target = {
      apiUrl: server.url,
      proxyHeaders: createProxyHeaders({
        headers: { 'cf-access-token': proxy.acceptedToken },
      }),
    };
    const upload = (uploadUrl: string) =>
      putUploadFile({
        target,
        uploadUrl,
        contentType: 'application/octet-stream',
        bytes: new TextEncoder().encode('bundle'),
        signal: new AbortController().signal,
      });

    expect(await upload(`${server.url}/file-upload/file-id?token=t`)).toBe(200);
    expect(server.requests.at(-1)?.headers['cf-access-token']).toBe(
      proxy.acceptedToken,
    );

    await upload(`${otherServerUrl}/bucket/file-id?signature=s`);

    expect(server.requests.at(-1)?.headers['cf-access-token']).toBeUndefined();
  });

  it('shares one header command run between concurrent reads and renewals', async () => {
    const counterPath = join(home, 'header-command-runs');
    const proxyHeaders = createProxyHeaders({
      headers: { 'x-team': 'platform' },
      headerCommand: createNodeCommand(COUNTING_TOKEN_SCRIPT, counterPath),
    });
    const signal = new AbortController().signal;

    const [firstHeaders, secondHeaders] = await Promise.all([
      proxyHeaders?.read(signal),
      proxyHeaders?.read(signal),
    ]);

    expect(firstHeaders).toEqual({
      'x-team': 'platform',
      'cf-access-token': 'token-1',
    });
    expect(secondHeaders).toBe(firstHeaders);

    if (!isDefined(firstHeaders) || !isDefined(secondHeaders)) {
      throw new Error('Expected proxy headers.');
    }

    proxyHeaders?.renew(firstHeaders);
    const renewedHeaders = await proxyHeaders?.read(signal);
    proxyHeaders?.renew(secondHeaders);

    expect(renewedHeaders).toMatchObject({ 'cf-access-token': 'token-2' });
    expect(await proxyHeaders?.read(signal)).toBe(renewedHeaders);
    expect(await readFile(counterPath, 'utf8')).toBe('2');
  });

  it('keeps proxy settings out of app worker environments', () => {
    expect(
      createAppWorkerEnvironment({
        PATH: '/usr/bin',
        TWENTY_PROXY_HEADERS: 'cf-access-token: secret',
        TWENTY_PROXY_HEADER_COMMAND: 'cloudflared access token',
      }),
    ).toEqual({ PATH: '/usr/bin' });
  });
});
