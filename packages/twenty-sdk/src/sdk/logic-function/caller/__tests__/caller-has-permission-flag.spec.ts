import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { callerHasPermissionFlag } from '@/sdk/logic-function/caller/caller-has-permission-flag';

describe('callerHasPermissionFlag', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('asks the server about the permission flag and returns its answer', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { appCallerHasPermissionFlag: true } }),
        { status: 200 },
      ),
    );

    expect(await callerHasPermissionFlag('WORKSPACE_MEMBERS')).toBe(true);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain(
      'appCallerHasPermissionFlag(permissionFlag: $permissionFlag)',
    );
    expect(sentBody.variables).toEqual({
      permissionFlag: 'WORKSPACE_MEMBERS',
    });
  });

  it('does not send any caller identity: the server reads it from the token', async () => {
    process.env.TWENTY_CALLER = JSON.stringify({
      type: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
    });

    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { appCallerHasPermissionFlag: false } }),
        { status: 200 },
      ),
    );

    expect(await callerHasPermissionFlag('ROLES')).toBe(false);

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

    expect(sentBody.variables).toEqual({ permissionFlag: 'ROLES' });

    delete process.env.TWENTY_CALLER;
  });

  it('throws when the server rejects the query', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'Forbidden' }] }), {
        status: 200,
      }),
    );

    await expect(callerHasPermissionFlag('ROLES')).rejects.toThrow('Forbidden');
  });
});
