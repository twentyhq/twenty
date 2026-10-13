import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveTeamsSenderWorkspaceMemberId } from 'src/features/chat/logic-functions/utils/resolve-teams-sender-workspace-member-id';

const {
  getTeamsConversationMemberMock,
  findWorkspaceMemberIdByEmailMock,
  findTeamsUserLinkWorkspaceMemberIdMock,
  createTeamsUserLinkMock,
} = vi.hoisted(() => ({
  getTeamsConversationMemberMock: vi.fn(),
  findWorkspaceMemberIdByEmailMock: vi.fn(),
  findTeamsUserLinkWorkspaceMemberIdMock: vi.fn(),
  createTeamsUserLinkMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-conversation-member',
  () => ({ getTeamsConversationMember: getTeamsConversationMemberMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/find-workspace-member-id-by-email',
  () => ({ findWorkspaceMemberIdByEmail: findWorkspaceMemberIdByEmailMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-user-link-workspace-member-id',
  () => ({
    findTeamsUserLinkWorkspaceMemberId: findTeamsUserLinkWorkspaceMemberIdMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/create-teams-user-link',
  () => ({
    createTeamsUserLink: createTeamsUserLinkMock,
  }),
);

const CLIENT = { query: vi.fn(), mutation: vi.fn() };
const CLAIMED_TENANT_ID = 'claimed-tenant-id';

const resolve = () =>
  resolveTeamsSenderWorkspaceMemberId({
    client: CLIENT,
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    conversationId: 'a:personal-conversation',
    teamsUserId: '29:user-id',
    teamsTenantId: CLAIMED_TENANT_ID,
    accessToken: 'connector-access-token',
  });

describe('resolveTeamsSenderWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('workspace-member-id');
    findTeamsUserLinkWorkspaceMemberIdMock.mockResolvedValue(undefined);
    createTeamsUserLinkMock.mockResolvedValue(undefined);
  });

  it('should use the linked workspace member before matching on email', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      objectId: 'aad-object-id',
      tenantId: CLAIMED_TENANT_ID,
      email: 'jane@acme.com',
    });
    findTeamsUserLinkWorkspaceMemberIdMock.mockResolvedValue(
      'linked-workspace-member-id',
    );

    expect(await resolve()).toBe('linked-workspace-member-id');
    expect(findTeamsUserLinkWorkspaceMemberIdMock).toHaveBeenCalledTimes(1);
    expect(findTeamsUserLinkWorkspaceMemberIdMock).toHaveBeenCalledWith({
      client: CLIENT,
      teamsTenantId: CLAIMED_TENANT_ID,
      teamsUserAadObjectId: 'aad-object-id',
    });
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('should save a link when the sender is matched on email', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      objectId: 'aad-object-id',
      name: 'Jane Doe',
      tenantId: CLAIMED_TENANT_ID,
      email: 'jane@acme.com',
    });

    expect(await resolve()).toBe('workspace-member-id');
    expect(createTeamsUserLinkMock).toHaveBeenCalledTimes(1);
    expect(createTeamsUserLinkMock).toHaveBeenCalledWith({
      client: CLIENT,
      name: 'Jane Doe',
      teamsTenantId: CLAIMED_TENANT_ID,
      teamsUserAadObjectId: 'aad-object-id',
      workspaceMemberId: 'workspace-member-id',
      source: 'AUTO',
    });
  });

  it('should still answer when saving the link fails', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      objectId: 'aad-object-id',
      tenantId: CLAIMED_TENANT_ID,
      email: 'jane@acme.com',
    });
    createTeamsUserLinkMock.mockRejectedValue(new Error('duplicate link'));
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    expect(await resolve()).toBe('workspace-member-id');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    consoleWarnSpy.mockRestore();
  });

  it('should match the sender to a workspace member by email', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      tenantId: CLAIMED_TENANT_ID,
      email: 'jane@acme.com',
      userPrincipalName: 'jane.doe@acme.onmicrosoft.com',
    });

    expect(await resolve()).toBe('workspace-member-id');
    expect(getTeamsConversationMemberMock).toHaveBeenCalledWith({
      serviceUrl: 'https://smba.trafficmanager.net/amer/',
      conversationId: 'a:personal-conversation',
      memberId: '29:user-id',
      accessToken: 'connector-access-token',
    });
    expect(findWorkspaceMemberIdByEmailMock).toHaveBeenCalledWith({
      client: CLIENT,
      email: 'jane@acme.com',
    });
  });

  it('should fall back to the user principal name when Teams returns no email', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      tenantId: CLAIMED_TENANT_ID,
      userPrincipalName: 'jane@acme.com',
    });

    expect(await resolve()).toBe('workspace-member-id');
    expect(findWorkspaceMemberIdByEmailMock).toHaveBeenCalledWith({
      client: CLIENT,
      email: 'jane@acme.com',
    });
  });

  it('should not look up a member when the sender has no email at all', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      tenantId: CLAIMED_TENANT_ID,
    });

    expect(await resolve()).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should not trust an email asserted by a tenant other than the claimed one', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      tenantId: 'other-tenant-id',
      email: 'jane@acme.com',
    });

    expect(await resolve()).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should not trust an email when Teams does not report the sender tenant', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
      email: 'jane@acme.com',
    });

    expect(await resolve()).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });
});
