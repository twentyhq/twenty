import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { buildIdentifyAccountHandler } from '@/sdk/logic-function/connections/build-identify-account-handler';

const PAYLOAD = {
  connectionProviderId: 'provider-1',
  connectionProviderName: 'slack',
  accessToken: 'provisional-token',
};

const mockJsonResponse = (
  fetchSpy: MockInstance<typeof fetch>,
  body: unknown,
  init: ResponseInit = { status: 200 },
) => {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify(body), init));
};

describe('buildIdentifyAccountHandler', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('calls the endpoint with the provisional access token as a bearer token', async () => {
    mockJsonResponse(fetchSpy, { team_id: 'T123' });

    const identifyAccount = buildIdentifyAccountHandler({
      endpoint: 'https://slack.com/api/auth.test',
      method: 'POST',
      body: 'probe=1',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      externalAccountIdPath: 'team_id',
    });

    await identifyAccount(PAYLOAD);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://slack.com/api/auth.test');
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: 'probe=1',
        headers: expect.objectContaining({
          Authorization: 'Bearer provisional-token',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }),
    );
  });

  it('defaults to GET without a body', async () => {
    mockJsonResponse(fetchSpy, { id: 'U1' });

    await buildIdentifyAccountHandler({
      endpoint: 'https://api.example.com/me',
      externalAccountIdPath: 'id',
    })(PAYLOAD);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(requestInit?.method).toBe('GET');
    expect(requestInit?.body).toBeUndefined();
  });

  it('does not let custom headers override the bearer token', async () => {
    mockJsonResponse(fetchSpy, { id: 'U1' });

    await buildIdentifyAccountHandler({
      endpoint: 'https://api.example.com/me',
      headers: { Authorization: 'Bearer something-else' },
      externalAccountIdPath: 'id',
    })(PAYLOAD);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(requestInit?.headers).toEqual(
      expect.objectContaining({ Authorization: 'Bearer provisional-token' }),
    );
  });

  it('resolves nested dot paths for the id and the handle', async () => {
    mockJsonResponse(fetchSpy, {
      team: { id: 'T999', name: 'Acme' },
    });

    const result = await buildIdentifyAccountHandler({
      endpoint: 'https://api.example.com/me',
      externalAccountIdPath: 'team.id',
      handlePath: 'team.name',
    })(PAYLOAD);

    expect(result).toEqual({ externalAccountId: 'T999', handle: 'Acme' });
  });

  it('stringifies numeric ids', async () => {
    mockJsonResponse(fetchSpy, { user: { id: 42 } });

    const result = await buildIdentifyAccountHandler({
      endpoint: 'https://api.example.com/me',
      externalAccountIdPath: 'user.id',
    })(PAYLOAD);

    expect(result).toEqual({ externalAccountId: '42' });
  });

  it('omits the handle when its path does not resolve to a non-empty string', async () => {
    mockJsonResponse(fetchSpy, { team_id: 'T123', team: '' });

    const result = await buildIdentifyAccountHandler({
      endpoint: 'https://slack.com/api/auth.test',
      externalAccountIdPath: 'team_id',
      handlePath: 'team',
    })(PAYLOAD);

    expect(result).toEqual({ externalAccountId: 'T123' });
  });

  it('throws when the id path is missing from the response', async () => {
    mockJsonResponse(fetchSpy, { ok: false, error: 'invalid_auth' });

    await expect(
      buildIdentifyAccountHandler({
        endpoint: 'https://slack.com/api/auth.test',
        externalAccountIdPath: 'team_id',
      })(PAYLOAD),
    ).rejects.toThrow(/returned no value at "team_id"/);
  });

  it('throws when the id resolves to an empty string', async () => {
    mockJsonResponse(fetchSpy, { team: { id: '   ' } });

    await expect(
      buildIdentifyAccountHandler({
        endpoint: 'https://api.example.com/me',
        externalAccountIdPath: 'team.id',
      })(PAYLOAD),
    ).rejects.toThrow(/returned no value at "team.id"/);
  });

  it('throws on non-2xx responses without echoing the access token', async () => {
    mockJsonResponse(
      fetchSpy,
      { error: 'unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    const error = await buildIdentifyAccountHandler({
      endpoint: 'https://api.example.com/me',
      externalAccountIdPath: 'id',
    })(PAYLOAD).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/HTTP 401/);
    expect((error as Error).message).not.toContain('provisional-token');
  });
});
