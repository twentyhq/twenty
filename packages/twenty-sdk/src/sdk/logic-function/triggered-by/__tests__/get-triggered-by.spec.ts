import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { getTriggeredBy } from '@/sdk/logic-function/triggered-by/get-triggered-by';

describe('getTriggeredBy', () => {
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

  it('returns the person the run was triggered by', async () => {
    const triggeredBy = {
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workspaceMemberId: 'workspace-member-1',
      permissionFlags: ['WORKSPACE_MEMBERS', 'ROLES'],
    };

    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { logicFunctionTriggeredBy: triggeredBy } }),
        { status: 200 },
      ),
    );

    expect(await getTriggeredBy()).toEqual(triggeredBy);
  });

  it('does not send any identity: the server reads it from the token', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { logicFunctionTriggeredBy: null } }),
        {
          status: 200,
        },
      ),
    );

    await getTriggeredBy();

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('logicFunctionTriggeredBy');
    expect(sentBody.variables).toEqual({});
  });

  it('returns null for a run nobody triggered', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { logicFunctionTriggeredBy: null } }),
        {
          status: 200,
        },
      ),
    );

    expect(await getTriggeredBy()).toBeNull();
  });

  it('throws when the server rejects the query', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'Forbidden' }] }), {
        status: 200,
      }),
    );

    await expect(getTriggeredBy()).rejects.toThrow('Forbidden');
  });
});
