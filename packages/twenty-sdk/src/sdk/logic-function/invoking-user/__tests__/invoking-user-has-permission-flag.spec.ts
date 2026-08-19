import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { invokingUserHasPermissionFlag } from '@/sdk/logic-function/invoking-user/invoking-user-has-permission-flag';

describe('invokingUserHasPermissionFlag', () => {
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
        JSON.stringify({ data: { invokingUserHasPermissionFlag: true } }),
        { status: 200 },
      ),
    );

    expect(await invokingUserHasPermissionFlag('WORKSPACE_MEMBERS')).toBe(true);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain(
      'invokingUserHasPermissionFlag(permissionFlag: $permissionFlag)',
    );
    expect(sentBody.variables).toEqual({
      permissionFlag: 'WORKSPACE_MEMBERS',
    });
  });

  it('does not send any identity: the server reads it from the token', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { invokingUserHasPermissionFlag: false } }),
        { status: 200 },
      ),
    );

    expect(await invokingUserHasPermissionFlag('ROLES')).toBe(false);

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

    expect(sentBody.variables).toEqual({ permissionFlag: 'ROLES' });
  });

  it('throws when the server rejects the query', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'Forbidden' }] }), {
        status: 200,
      }),
    );

    await expect(invokingUserHasPermissionFlag('ROLES')).rejects.toThrow(
      'Forbidden',
    );
  });
});
