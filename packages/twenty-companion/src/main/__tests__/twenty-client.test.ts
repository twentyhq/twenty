import { createDeferred } from './create-deferred';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agendaSchema } from '../../shared/types';
import { TwentyClient } from '../twenty-client';
import { DesktopRecorderUnavailableError } from '../oauth';

const fetchMock = vi.fn();
const credentials = {
  serverUrl: 'https://crm.twenty.com',
  clientId: 'client-1',
  accessToken: 'test-access',
  refreshToken: 'test-refresh',
  expiresAt: Date.now() + 3_600_000,
};
const store = {
  readCredentials: vi.fn(),
  clearCredentials: vi.fn(),
  writeCredentials: vi.fn(),
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  vi.mocked(store.readCredentials).mockResolvedValue(credentials);
});
afterEach(() => vi.unstubAllGlobals());
const discovery = (logo?: string) =>
  fetchMock.mockImplementation(async (url: string) => {
    if (url.endsWith('/client-config'))
      return json({ publicFunctionDomain: 'withtwenty.com' });
    if (url.endsWith('/metadata'))
      return json({
        data: {
          currentWorkspace: {
            id: 'workspace-1',
            displayName: 'Twenty',
            logo,
            subdomain: 'twenty',
            workspaceUrls: {
              subdomainUrl: 'https://twenty.twenty.com/',
              customUrl: 'https://crm.twenty.com/',
            },
          },
        },
      });
    return json({ message: 'No Route trigger found' }, 404);
  });

describe('cloud custom-domain connection', () => {
  it('does not save a new account when the recording backend is unavailable', async () => {
    discovery();
    const client = new TwentyClient(store);
    await client.restore();
    await expect(
      client.connect({ ...credentials, clientId: 'new-client' }),
    ).rejects.toThrow('Install it to continue');
    expect(store.writeCredentials).not.toHaveBeenCalled();
    await client.disconnect();
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${credentials.serverUrl}/oauth/revoke`,
      expect.objectContaining({
        body: new URLSearchParams({
          token: credentials.refreshToken,
          client_id: credentials.clientId,
        }),
      }),
    );
  });
  it('resolves the workspace logo using Twenty image URLs', async () => {
    discovery('workspace-logo.png?token=signed-image-token');
    const client = new TwentyClient(store);
    await client.restore();
    await client
      .companion({ action: 'agenda' }, agendaSchema)
      .catch(() => undefined);
    expect(client.workspace?.logoUrl).toBe(
      'https://crm.twenty.com/files/workspace-logo.png?token=signed-image-token',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://crm.twenty.com/metadata',
      expect.objectContaining({
        body: expect.stringContaining('displayName logo'),
      }),
    );
  });

  it('ignores image URLs that cannot be loaded safely', async () => {
    discovery('https://user:password@example.com/logo.png');
    const client = new TwentyClient(store);
    await client.restore();
    await client
      .companion({ action: 'agenda' }, agendaSchema)
      .catch(() => undefined);
    expect(client.workspace).toEqual({ id: 'workspace-1', name: 'Twenty' });
  });

  it('uses the workspace function domain and distinguishes a missing backend from failed login', async () => {
    discovery();
    const client = new TwentyClient(store);
    await client.restore();
    await expect(
      client.companion({ action: 'agenda' }, agendaSchema),
    ).rejects.toThrow(
      'Desktop Recorder is unavailable in this workspace. Install it to continue.',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://twenty.withtwenty.com/companion/desktop',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'agenda' }),
        redirect: 'error',
      }),
    );
    expect(client.workspace).toEqual({ id: 'workspace-1', name: 'Twenty' });
    expect(client.workspaceUrl).toBe('https://crm.twenty.com');
  });
  it('does not misdiagnose a missing metadata endpoint as an uninstalled companion', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/client-config')
        ? json({ publicFunctionDomain: 'withtwenty.com' })
        : json({}, 404),
    );
    const client = new TwentyClient(store);
    await client.restore();
    await expect(
      client.companion({ action: 'agenda' }, agendaSchema),
    ).rejects.toThrow('404 for /metadata');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('handles GraphQL errors returned with HTTP 200', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/client-config')
        ? json({ publicFunctionDomain: 'withtwenty.com' })
        : json({ errors: [{ message: 'Unauthorized' }] }),
    );
    const client = new TwentyClient(store);
    await client.restore();
    await expect(
      client.companion({ action: 'agenda' }, agendaSchema),
    ).rejects.toThrow('Twenty could not load your workspace');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('returns the personal agenda once the backend is available', async () => {
    discovery();
    const fallback = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/companion/desktop')
        ? json({
            workspace: { id: 'workspace-1', name: 'Twenty' },
            meetings: [],
            recordings: [],
            calendarConnected: true,
          })
        : fallback?.(url),
    );
    const client = new TwentyClient(store);
    await client.restore();
    expect(await client.companion({ action: 'agenda' }, agendaSchema)).toEqual({
      workspace: { id: 'workspace-1', name: 'Twenty' },
      recordings: [],
      meetings: [],
      calendarConnected: true,
    });
  });
});

it('rejects incomplete agenda responses at the API boundary', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop') ? json({ meetings: [] }) : fallback?.(url),
  );
  const client = new TwentyClient(store);
  await client.restore();
  await expect(
    client.companion({ action: 'agenda' }, agendaSchema),
  ).rejects.toThrow('incomplete response');
});

it('does not restore a signed-out session when a token refresh finishes late', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  const refresh = createDeferred<Response>();
  const requested = createDeferred<void>();
  fetchMock.mockImplementation(async (url: string) => {
    if (url.endsWith('/oauth/token')) {
      requested.resolve();
      return refresh.promise;
    }
    return url.endsWith('/oauth/revoke') ? json({}) : fallback?.(url);
  });
  vi.mocked(store.readCredentials).mockResolvedValue({
    ...credentials,
    expiresAt: 0,
  });
  const client = new TwentyClient(store);
  await client.restore();
  const request = client
    .companion({ action: 'agenda' }, agendaSchema)
    .catch((error: unknown) => error);
  await requested.promise;
  await client.disconnect();
  refresh.resolve(
    json({
      access_token: 'rotated',
      refresh_token: 'rotated-refresh',
      expires_in: 3600,
    }),
  );
  expect(await request).toBeInstanceOf(Error);
  expect(store.writeCredentials).not.toHaveBeenCalled();
  await expect(
    client.companion({ action: 'agenda' }, agendaSchema),
  ).rejects.toThrow('Connect your Twenty workspace');
});

it('clears credentials after an in-flight refresh write, preserving disk sign-out', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/oauth/token')
      ? json({
          access_token: 'rotated',
          refresh_token: 'rotated-refresh',
          expires_in: 3600,
        })
      : url.endsWith('/oauth/revoke')
        ? json({})
        : fallback?.(url),
  );
  const writing = createDeferred<void>();
  const finishWrite = createDeferred<void>();
  vi.mocked(store.readCredentials).mockResolvedValue({
    ...credentials,
    expiresAt: 0,
  });
  vi.mocked(store.writeCredentials).mockImplementationOnce(() => {
    writing.resolve();
    return finishWrite.promise;
  });
  const client = new TwentyClient(store);
  await client.restore();
  const request = client
    .companion({ action: 'agenda' }, agendaSchema)
    .catch((error: unknown) => error);
  await writing.promise;
  const disconnect = client.disconnect();
  expect(store.clearCredentials).not.toHaveBeenCalled();
  finishWrite.resolve();
  await disconnect;
  expect(await request).toBeInstanceOf(Error);
  expect(store.clearCredentials).toHaveBeenCalledOnce();
  expect(client.workspace).toBeNull();
});

it('accepts null timestamps while a recording is being prepared', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop')
      ? json({
          workspace: { id: 'workspace-1', name: 'Twenty' },
          meetings: [],
          calendarConnected: true,
          recordings: [
            {
              id: 'recording-1',
              title: 'Pending conversation',
              status: 'JOINING',
              startedAt: null,
              endedAt: null,
              calendarEventId: null,
            },
          ],
        })
      : fallback?.(url),
  );
  const client = new TwentyClient(store);
  await client.restore();
  expect(
    (await client.companion({ action: 'agenda' }, agendaSchema)).recordings[0],
  ).toMatchObject({ status: 'JOINING', startedAt: null });
});

it.each([401, 403, 500, 503])(
  'does not suggest reinstalling after HTTP %s',
  async (status) => {
    discovery();
    const fallback = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/desktop') ? json({}, status) : fallback?.(url),
    );
    const client = new TwentyClient(store);
    await expect(client.connect(credentials)).rejects.toThrow(
      `Twenty returned ${status}`,
    );
    expect(store.writeCredentials).not.toHaveBeenCalled();
  },
);

it.each([
  new TypeError('Failed to fetch'),
  new DOMException('Request timed out', 'TimeoutError'),
])('preserves connection failures: %s', async (error) => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) => {
    if (url.endsWith('/desktop')) throw error;
    return fallback?.(url);
  });
  const client = new TwentyClient(store);
  await expect(client.connect(credentials)).rejects.toBe(error);
  expect(store.writeCredentials).not.toHaveBeenCalled();
});

it('does not suggest reinstalling for an invalid configuration response', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop') ? json({}) : fallback?.(url),
  );
  const error = await new TwentyClient(store)
    .connect(credentials)
    .catch((error: unknown) => error);
  expect(error).toBeInstanceOf(Error);
  expect(error).not.toBeInstanceOf(DesktopRecorderUnavailableError);
  expect(store.writeCredentials).not.toHaveBeenCalled();
});

it('offers installation when Twenty explicitly reports an uninstalled app', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop')
      ? json({ error: 'application_not_installed' }, 400)
      : fallback?.(url),
  );
  await expect(
    new TwentyClient(store).connect(credentials),
  ).rejects.toBeInstanceOf(DesktopRecorderUnavailableError);
  expect(store.writeCredentials).not.toHaveBeenCalled();
});

it('reuses validated workspace discovery after saving a connection', async () => {
  discovery('logo.png');
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) =>
    url.endsWith('/desktop')
      ? json(
          JSON.parse(String(init?.body)).action === 'configuration'
            ? { apiUrl: 'https://eu-central-1.recall.ai' }
            : {
                workspace: { id: 'workspace-1', name: 'Twenty' },
                meetings: [],
                recordings: [],
                calendarConnected: true,
              },
        )
      : fallback?.(url),
  );
  const client = new TwentyClient(store);
  await client.connect(credentials);
  expect(client.workspace?.logoUrl).toBe(
    'https://crm.twenty.com/files/logo.png',
  );
  await client.companion({ action: 'agenda' }, agendaSchema);
  expect(
    fetchMock.mock.calls.filter(([url]) => url.endsWith('/metadata')),
  ).toHaveLength(1);
  expect(
    fetchMock.mock.calls.filter(([url]) => url.endsWith('/client-config')),
  ).toHaveLength(1);
});

it('preserves the current workspace when saving a replacement connection fails', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop')
      ? json({ apiUrl: 'https://eu-central-1.recall.ai' })
      : fallback?.(url),
  );
  const client = new TwentyClient(store);
  await client.connect(credentials);
  const workspace = client.workspace;
  vi.mocked(store.writeCredentials).mockRejectedValueOnce(
    new Error('Keychain unavailable'),
  );
  await expect(
    client.connect({ ...credentials, clientId: 'replacement' }),
  ).rejects.toThrow('Keychain unavailable');
  expect(client.workspace).toEqual(workspace);
  expect(client.workspaceUrl).toBe('https://crm.twenty.com');
});

it('aborts the configuration probe without saving credentials', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  const controller = new AbortController();
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (!url.endsWith('/desktop')) return fallback?.(url);
    return new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener(
        'abort',
        () => reject(init.signal?.reason),
        { once: true },
      );
      controller.abort();
    });
  });
  await expect(
    new TwentyClient(store).connect(credentials, controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(store.writeCredentials).not.toHaveBeenCalled();
});

it('restores the previous account when canceled during the credential write', async () => {
  discovery();
  const fallback = fetchMock.getMockImplementation();
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith('/desktop')
      ? json({ apiUrl: 'https://eu-central-1.recall.ai' })
      : fallback?.(url),
  );
  const client = new TwentyClient(store);
  await client.connect(credentials);
  const controller = new AbortController();
  vi.mocked(store.writeCredentials).mockImplementationOnce(async () => {
    controller.abort();
  });
  await expect(
    client.connect(
      { ...credentials, clientId: 'replacement' },
      controller.signal,
    ),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(store.writeCredentials).toHaveBeenLastCalledWith(credentials);
  expect(client.workspace?.id).toBe('workspace-1');
});
