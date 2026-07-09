import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getSalesforceApiVersion,
  SalesforceClient,
} from 'src/logic-functions/salesforce/salesforce-client';
import {
  SalesforceApiError,
  SalesforceAuthError,
  SalesforceConfigError,
} from 'src/logic-functions/salesforce/salesforce-errors';

const { listConnectionsMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: listConnectionsMock,
}));

const TEST_SESSION = {
  accessToken: 'token-123',
  instanceUrl: 'https://acme.my.salesforce.com',
};

const connection = (overrides: Record<string, unknown> = {}) => ({
  id: 'conn-1',
  providerName: 'salesforce',
  name: 'Salesforce',
  handle: 'admin@acme.com',
  visibility: 'workspace',
  userWorkspaceId: 'uw-1',
  accessToken: 'token-123',
  scopes: ['api', 'refresh_token', 'openid'],
  authFailedAt: null,
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const userInfoResponse = () =>
  jsonResponse({
    organization_id: '00Dxx0000001gER',
    urls: {
      rest: 'https://acme.my.salesforce.com/services/data/v{version}/',
    },
  });

describe('getSalesforceApiVersion', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should normalize the configured version', () => {
    vi.stubEnv('SALESFORCE_API_VERSION', 'v63.0');

    expect(getSalesforceApiVersion()).toBe('63.0');
  });

  it('should default when unset', () => {
    vi.stubEnv('SALESFORCE_API_VERSION', '');

    expect(getSalesforceApiVersion()).toBe('62.0');
  });
});

describe('SalesforceClient session', () => {
  beforeEach(() => {
    listConnectionsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should throw a config error when no connection exists', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const client = new SalesforceClient();

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceConfigError,
    );
  });

  it('should throw an auth error when all connections failed auth', async () => {
    listConnectionsMock.mockResolvedValue([
      connection({ authFailedAt: '2026-07-01T00:00:00Z' }),
    ]);

    const client = new SalesforceClient();

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceAuthError,
    );
  });

  it('should prefer a workspace-visible connection', async () => {
    listConnectionsMock.mockResolvedValue([
      connection({ id: 'conn-user', visibility: 'user', accessToken: 'user-token' }),
      connection({ id: 'conn-ws', visibility: 'workspace', accessToken: 'ws-token' }),
    ]);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(userInfoResponse())
      .mockResolvedValueOnce(
        jsonResponse({ totalSize: 0, done: true, records: [] }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient();

    await client.query('SELECT Id FROM Account');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer ws-token',
    );
  });

  it('should resolve the instance url from userinfo and query it', async () => {
    listConnectionsMock.mockResolvedValue([connection()]);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(userInfoResponse())
      .mockResolvedValueOnce(
        jsonResponse({ totalSize: 1, done: true, records: [{ Id: '001' }] }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient();
    const result = await client.query<{ Id: string }>('SELECT Id FROM Account');

    expect(result.records).toEqual([{ Id: '001' }]);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://login.salesforce.com/services/oauth2/userinfo',
    );
    expect(fetchMock.mock.calls[1][0]).toContain(
      'https://acme.my.salesforce.com/services/data/v62.0/query?q=SELECT%20Id%20FROM%20Account',
    );
  });

  it('should surface userinfo failures as auth errors', async () => {
    listConnectionsMock.mockResolvedValue([connection()]);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: 'invalid_token' }, 403),
      ),
    );

    const client = new SalesforceClient();

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceAuthError,
    );
  });
});

describe('SalesforceClient requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should re-open the session once on a 401 and retry', async () => {
    listConnectionsMock.mockResolvedValue([
      connection({ accessToken: 'fresh-token' }),
    ]);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          [{ message: 'Session expired', errorCode: 'INVALID_SESSION_ID' }],
          401,
        ),
      )
      .mockResolvedValueOnce(userInfoResponse())
      .mockResolvedValueOnce(
        jsonResponse({ totalSize: 0, done: true, records: [] }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_SESSION);
    const result = await client.query('SELECT Id FROM Account');

    expect(result.totalSize).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(
      'Bearer fresh-token',
    );
  });

  it('should retry server errors then fail with SalesforceApiError', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          jsonResponse([{ message: 'boom', errorCode: 'SERVER_ERROR' }], 500),
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_SESSION);

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceApiError,
    );
    // Initial attempt + 2 retries.
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 15_000);

  it('should not retry client errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          [{ message: 'malformed query', errorCode: 'MALFORMED_QUERY' }],
          400,
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_SESSION);

    await expect(client.query('SELECT bogus FROM Account')).rejects.toThrow(
      'malformed query',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should read organization info', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          totalSize: 1,
          done: true,
          records: [
            { Id: '00Dxx0000001gER', Name: 'Acme Corp', DefaultCurrencyIsoCode: 'EUR' },
          ],
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_SESSION);
    const orgInfo = await client.getOrgInfo();

    expect(orgInfo).toEqual({
      orgId: '00Dxx0000001gER',
      orgName: 'Acme Corp',
      currencyIsoCode: 'EUR',
    });
  });
});
