import { mkdtemp } from 'node:fs/promises';
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
import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { openBrowser } from '@/oauth/open-browser';

vi.mock('@/oauth/open-browser', () => ({ openBrowser: vi.fn() }));

const SUBDOMAIN_URL = 'https://acme.twenty.com';

const state: {
  workspaceUrls: unknown;
  discovery: unknown;
  discoveryStatus: number;
  metadataStatus: number;
} = {
  workspaceUrls: null,
  discovery: null,
  discoveryStatus: 200,
  metadataStatus: 200,
};

const server = await startTestServer((request, response) => {
  if (request.path === '/.well-known/oauth-authorization-server') {
    sendJson(response, state.discoveryStatus, state.discovery);

    return;
  }

  sendJson(response, state.metadataStatus, {
    data: { currentWorkspace: { workspaceUrls: state.workspaceUrls } },
  });
});

const stubStandardInput = ({ isTerminal }: { isTerminal: boolean }) =>
  vi
    .spyOn(process, 'stdin', 'get')
    .mockReturnValue(createStandardInputStub({ isTerminal }));

const runJson = async (args: string[]) => {
  const { stdout, exitCode } = await runCliForTest(['open', ...args, '--json']);

  return { envelope: parseSingleJsonLine(stdout), exitCode };
};

describe('open', () => {
  beforeEach(async () => {
    vi.stubEnv('HOME', await mkdtemp(join(tmpdir(), 'twenty-cli-open-')));
    vi.stubEnv('CI', '');
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'open-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    stubStandardInput({ isTerminal: true });
    state.workspaceUrls = { customUrl: null, subdomainUrl: SUBDOMAIN_URL };
    state.discovery = {
      authorization_endpoint: 'https://frontend.example/authorize?iss=api',
    };
    state.discoveryStatus = 200;
    state.metadataStatus = 200;
    server.requests.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.mocked(openBrowser).mockReset();
  });

  afterAll(async () => {
    await server.close();
  });

  it('opens the workspace in the browser', async () => {
    const { stdout, exitCode } = await runCliForTest(['open']);

    expect(exitCode).toBe(0);
    expect(openBrowser).toHaveBeenCalledTimes(1);
    expect(openBrowser).toHaveBeenCalledWith(`${SUBDOMAIN_URL}/`);
    expect(stdout).toContain(`Opening ${SUBDOMAIN_URL}/ in your browser.`);
    expect(server.requests.map((request) => request.path)).toEqual([
      '/metadata',
    ]);
    expect(server.requests[0].body).toContain('workspaceUrls');
  });

  it('prefers the custom domain and opens a page inside the workspace', async () => {
    state.workspaceUrls = {
      customUrl: 'https://crm.acme.com',
      subdomainUrl: SUBDOMAIN_URL,
    };

    const { exitCode } = await runCliForTest(['open', 'settings/applications']);

    expect(exitCode).toBe(0);
    expect(openBrowser).toHaveBeenCalledWith(
      'https://crm.acme.com/settings/applications',
    );
  });

  it('prints the address instead of opening a browser with --url-only', async () => {
    const { envelope, exitCode } = await runJson([
      '/objects/companies?view=all',
      '--url-only',
    ]);

    expect(exitCode).toBe(0);
    expect(envelope.data).toEqual({
      url: `${SUBDOMAIN_URL}/objects/companies?view=all`,
    });
    expect(openBrowser).not.toHaveBeenCalled();

    const human = await runCliForTest(['open', '--url-only']);

    expect(human.stdout.trim()).toBe(`${SUBDOMAIN_URL}/`);
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'JSON output', flags: ['--json'], isTerminal: true, ci: '' },
    { name: '--no-input', flags: ['--no-input'], isTerminal: true, ci: '' },
    { name: 'redirected stdin', flags: [], isTerminal: false, ci: '' },
    { name: 'CI', flags: [], isTerminal: true, ci: 'true' },
  ])('never opens a browser with $name', async ({ flags, isTerminal, ci }) => {
    vi.stubEnv('CI', ci);
    stubStandardInput({ isTerminal });

    const { stdout, stderr, exitCode } = await runCliForTest([
      'open',
      ...flags,
    ]);

    expect(exitCode).toBe(2);
    expect(`${stdout}${stderr}`).toContain('--url-only');
    expect(openBrowser).not.toHaveBeenCalled();
    expect(server.requests).toHaveLength(0);
  });

  it.each([
    'https://evil.example/login',
    'http:evil.example/login',
    '//evil.example/login',
    '/\\evil.example/login',
    '/.//evil.example/login',
    'foo/..//evil.example/login',
    '/%2e//evil.example/login',
    'javascript:alert(1)',
  ])('refuses %s as a page', async (page) => {
    const { envelope, exitCode } = await runJson([page, '--url-only']);

    expect(exitCode).toBe(2);
    expect(envelope.ok).toBe(false);
    expect(envelope.error.code).toBe('USAGE');

    const human = await runCliForTest(['open', page]);

    expect(human.exitCode).toBe(2);
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it.each([null, {}, { customUrl: null, subdomainUrl: '' }])(
    'uses the discovery frontend origin when workspace URLs are missing: %j',
    async (workspaceUrls) => {
      state.workspaceUrls = workspaceUrls;
      state.discovery = {
        authorization_endpoint:
          'https://ignored-user:ignored-password@frontend.example/authorize?iss=api#fragment',
      };

      const { envelope, exitCode } = await runJson([
        'settings/applications',
        '--url-only',
      ]);

      expect(exitCode).toBe(0);
      expect(envelope.data.url).toBe(
        'https://frontend.example/settings/applications',
      );
      expect(server.requests.map((request) => request.path)).toEqual([
        '/metadata',
        '/.well-known/oauth-authorization-server',
      ]);
      expect(server.requests[1].headers.authorization).toBeUndefined();

      const human = await runCliForTest(['open']);

      expect(human.exitCode).toBe(0);
      expect(openBrowser).toHaveBeenCalledWith('https://frontend.example/');
    },
  );

  it.each([
    undefined,
    '',
    'javascript:alert(1)',
    'file:///etc/passwd',
    '/authorize',
  ])(
    'rejects an invalid discovery frontend: %s',
    async (authorizationEndpoint) => {
      state.workspaceUrls = null;
      state.discovery = { authorization_endpoint: authorizationEndpoint };

      const { envelope, exitCode } = await runJson(['--url-only']);

      expect(exitCode).toBe(1);
      expect(envelope.error.code).toBe('INVALID_RESPONSE');
      expect(openBrowser).not.toHaveBeenCalled();
    },
  );

  it('rejects a failed discovery response', async () => {
    state.workspaceUrls = null;
    state.discoveryStatus = 404;

    const { envelope, exitCode } = await runJson(['--url-only']);

    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('INVALID_RESPONSE');
  });

  it('does not hide an authentication failure with the fallback', async () => {
    state.workspaceUrls = null;
    state.metadataStatus = 401;

    const { envelope, exitCode } = await runJson(['--url-only']);

    expect(exitCode).toBe(3);
    expect(envelope.error.code).toBe('AUTH_REQUIRED');
    expect(server.requests.map((request) => request.path)).toEqual([
      '/metadata',
    ]);
  });

  it('still rejects pages that leave the discovered frontend', async () => {
    state.workspaceUrls = null;

    const { envelope, exitCode } = await runJson([
      '/.//evil.example/login',
      '--url-only',
    ]);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('USAGE');
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it.each([
    { customUrl: null, subdomainUrl: 'javascript:alert(1)' },
    { customUrl: 'file:///etc/passwd', subdomainUrl: SUBDOMAIN_URL },
  ])(
    'refuses a workspace address it cannot open: %j',
    async (workspaceUrls) => {
      state.workspaceUrls = workspaceUrls;

      const { envelope, exitCode } = await runJson(['--url-only']);

      expect(exitCode).toBe(1);
      expect(envelope.error.code).toBe('INVALID_RESPONSE');

      const { exitCode: humanExitCode } = await runCliForTest(['open']);

      expect(humanExitCode).toBe(1);
      expect(openBrowser).not.toHaveBeenCalled();
    },
  );
});
