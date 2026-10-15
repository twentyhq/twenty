import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
const mockOpenBrowser = vi.fn();
const mockWaitForCallback = vi.fn();
const mockValidateAuth = vi.fn();

vi.mock('axios', () => ({
  default: {
    get: (...args: unknown[]) => mockAxiosGet(...args),
    post: (...args: unknown[]) => mockAxiosPost(...args),
  },
}));

vi.mock('@/cli/utilities/auth/open-browser', () => ({
  openBrowser: (...args: unknown[]) => mockOpenBrowser(...args),
}));

vi.mock('@/cli/utilities/auth/callback-server', () => ({
  startCallbackServer: async () => ({
    port: 4242,
    callbackUrl: 'http://127.0.0.1:4242/callback',
    waitForCallback: () => mockWaitForCallback(),
    close: () => {},
  }),
}));

vi.mock('@/cli/utilities/config/config-service', () => ({
  ConfigService: class {
    static setActiveRemote() {}
    setConfig = vi.fn();
    clearConfig = vi.fn();
  },
}));

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    validateAuth = mockValidateAuth;
  },
}));

const { authLoginOAuth } = await import('@/cli/operations/login-oauth');

type ConsoleLogSpy = MockInstance<typeof console.log>;

const getPrintedOutput = (logSpy: ConsoleLogSpy) =>
  logSpy.mock.calls.map((call) => call.join(' ')).join('\n');

describe('authLoginOAuth', () => {
  let logSpy: ConsoleLogSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockAxiosGet.mockResolvedValue({
      data: {
        authorization_endpoint: 'http://localhost:3001/authorize',
        token_endpoint: 'http://localhost:3000/oauth/token',
        cli_client_id: 'cli-client-id',
      },
    });
    mockAxiosPost.mockResolvedValue({
      data: { access_token: 'access', refresh_token: 'refresh' },
    });
    mockWaitForCallback.mockResolvedValue({ success: true, code: 'code' });
    mockValidateAuth.mockResolvedValue({ authValid: true, serverUp: true });
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should print the authorization URL even when the browser opened', async () => {
    mockOpenBrowser.mockResolvedValue(true);

    const result = await authLoginOAuth({ apiUrl: 'http://localhost:3000' });

    expect(result.success).toBe(true);

    const output = getPrintedOutput(logSpy);

    expect(output).toContain('http://localhost:3001/authorize?');
    expect(output).toContain('clientId=cli-client-id');
    expect(output).toContain('Waiting for approval in the browser');
  });

  it('should tell the user to open the URL when the browser could not be opened', async () => {
    mockOpenBrowser.mockResolvedValue(false);

    await authLoginOAuth({ apiUrl: 'http://localhost:3000' });

    expect(getPrintedOutput(logSpy)).toContain(
      'Open this URL in your browser to authenticate',
    );
  });
});
