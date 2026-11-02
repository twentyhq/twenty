import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';

const importInboxMention = async () => {
  const module = await import('@/sdk/inbox/mentions/inbox-mention');

  return module.inboxMention;
};

type WorkspaceMemberFixture = {
  name: { firstName: string; lastName: string };
  userEmail: string;
};

const workspaceMemberResponse = (workspaceMember: WorkspaceMemberFixture) =>
  new Response(JSON.stringify({ data: { workspaceMember } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('inboxMention', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'access-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('mentions a workspace member by the full name the composer shows', async () => {
    fetchSpy.mockResolvedValue(
      workspaceMemberResponse({
        name: { firstName: 'Jony', lastName: 'Ive' },
        userEmail: 'jony@apple.dev',
      }),
    );

    const inboxMention = await importInboxMention();

    await expect(
      inboxMention({ workspaceMemberId: WORKSPACE_MEMBER_ID }),
    ).resolves.toBe(
      `[[record:workspaceMember:${WORKSPACE_MEMBER_ID}:Jony Ive]]`,
    );

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(String(url)).toBe(
      `https://api.test/rest/workspaceMembers/${WORKSPACE_MEMBER_ID}`,
    );
    expect(requestInit?.method).toBe('GET');
  });

  it('falls back to the email of a member without a name', async () => {
    fetchSpy.mockResolvedValue(
      workspaceMemberResponse({
        name: { firstName: '', lastName: '' },
        userEmail: 'jony@apple.dev',
      }),
    );

    const inboxMention = await importInboxMention();

    await expect(
      inboxMention({ workspaceMemberId: WORKSPACE_MEMBER_ID }),
    ).resolves.toBe(
      `[[record:workspaceMember:${WORKSPACE_MEMBER_ID}:jony@apple.dev]]`,
    );
  });

  it('keeps the mention renderable when the name has brackets or line breaks', async () => {
    fetchSpy.mockResolvedValue(
      workspaceMemberResponse({
        name: { firstName: 'Jony [Design]', lastName: 'Ive\nJr' },
        userEmail: 'jony@apple.dev',
      }),
    );

    const inboxMention = await importInboxMention();

    await expect(
      inboxMention({ workspaceMemberId: WORKSPACE_MEMBER_ID }),
    ).resolves.toBe(
      `[[record:workspaceMember:${WORKSPACE_MEMBER_ID}:Jony (Design) Ive Jr]]`,
    );
  });
});
