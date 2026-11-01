import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { listConnections } from '@/sdk/logic-function/connections/list-connections';
import { type AppConnectionWithoutVisibility } from '@/sdk/logic-function/connections/utils/with-legacy-connection-visibility.util';

const sharedConnection: AppConnectionWithoutVisibility = {
  id: 'shared',
  providerName: 'linear',
  name: 'Linear #1',
  handle: 'octocat@example.com',
  externalAccountId: null,
  scope: 'WORKSPACE',
  userWorkspaceId: 'uws-me',
  workspaceMemberId: 'wm-me',
  providerType: 'oauth',
  accessToken: 'fresh',
  scopes: ['read'],
  authFailedAt: null,
  authFailedReason: null,
};

describe('listConnections', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  const sentFilter = () =>
    JSON.parse(fetchSpy.mock.calls[0][1]?.body as string).variables.filter;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { appConnections: [sharedConnection] } }),
        { status: 200 },
      ),
    );
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('derives the deprecated visibility from scope', async () => {
    const connections = await listConnections();

    expect(connections).toEqual([
      { ...sharedConnection, visibility: 'workspace' },
    ]);
  });

  it('sends the scope filter as is', async () => {
    await listConnections({ providerName: 'linear', scope: 'USER' });

    expect(sentFilter()).toEqual({ providerName: 'linear', scope: 'USER' });
  });

  it('sends the deprecated visibility filter as scope', async () => {
    await listConnections({ visibility: 'workspace' });

    expect(sentFilter()).toEqual({ scope: 'WORKSPACE' });
  });
});
