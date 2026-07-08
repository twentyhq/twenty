import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getSalesforceConfig,
  SalesforceClient,
} from 'src/logic-functions/salesforce/salesforce-client';
import {
  SalesforceApiError,
  SalesforceAuthError,
  SalesforceConfigError,
} from 'src/logic-functions/salesforce/salesforce-errors';

const TEST_CONFIG = {
  instanceUrl: 'https://acme.my.salesforce.com',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  apiVersion: '62.0',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const tokenResponse = () => jsonResponse({ access_token: 'token-123' });

describe('getSalesforceConfig', () => {
  beforeEach(() => {
    vi.stubEnv('SALESFORCE_INSTANCE_URL', 'https://acme.my.salesforce.com/');
    vi.stubEnv('SALESFORCE_CLIENT_ID', 'client-id');
    vi.stubEnv('SALESFORCE_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('SALESFORCE_API_VERSION', 'v63.0');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should normalize the instance url and api version', () => {
    const config = getSalesforceConfig();

    expect(config.instanceUrl).toBe('https://acme.my.salesforce.com');
    expect(config.apiVersion).toBe('63.0');
  });

  it('should throw a config error when credentials are missing', () => {
    vi.stubEnv('SALESFORCE_CLIENT_SECRET', '');

    expect(() => getSalesforceConfig()).toThrow(SalesforceConfigError);
  });

  it('should default the api version when unset', () => {
    vi.stubEnv('SALESFORCE_API_VERSION', '');

    expect(getSalesforceConfig().apiVersion).toBe('62.0');
  });
});

describe('SalesforceClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should authenticate then run a query', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse({ totalSize: 1, done: true, records: [{ Id: '001' }] }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_CONFIG);
    const result = await client.query<{ Id: string }>('SELECT Id FROM Account');

    expect(result.records).toEqual([{ Id: '001' }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://acme.my.salesforce.com/services/oauth2/token',
    );
    expect(fetchMock.mock.calls[1][0]).toContain(
      '/services/data/v62.0/query?q=SELECT%20Id%20FROM%20Account',
    );
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer token-123',
    );
  });

  it('should surface authentication failures as SalesforceAuthError', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(
          { error: 'invalid_client', error_description: 'invalid client credentials' },
          400,
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_CONFIG);

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceAuthError,
    );
  });

  it('should refresh the token once on a 401 and retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse([{ message: 'Session expired', errorCode: 'INVALID_SESSION_ID' }], 401),
      )
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse({ totalSize: 0, done: true, records: [] }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_CONFIG);
    const result = await client.query('SELECT Id FROM Account');

    expect(result.totalSize).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should retry server errors then fail with SalesforceApiError', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tokenResponse())
      .mockImplementation(() =>
        Promise.resolve(
          jsonResponse([{ message: 'boom', errorCode: 'SERVER_ERROR' }], 500),
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_CONFIG);

    await expect(client.query('SELECT Id FROM Account')).rejects.toThrow(
      SalesforceApiError,
    );
    // 1 token call + 3 attempts (initial + 2 retries).
    expect(fetchMock).toHaveBeenCalledTimes(4);
  }, 15_000);

  it('should not retry client errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse(
          [{ message: 'malformed query', errorCode: 'MALFORMED_QUERY' }],
          400,
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const client = new SalesforceClient(TEST_CONFIG);

    await expect(client.query('SELECT bogus FROM Account')).rejects.toThrow(
      'malformed query',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should read organization info', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tokenResponse())
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

    const client = new SalesforceClient(TEST_CONFIG);
    const orgInfo = await client.getOrgInfo();

    expect(orgInfo).toEqual({
      orgId: '00Dxx0000001gER',
      orgName: 'Acme Corp',
      currencyIsoCode: 'EUR',
    });
  });
});
