import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveTeamsSenderWorkspaceMemberId } from 'src/features/chat/logic-functions/utils/resolve-teams-sender-workspace-member-id';

const { getTeamsConversationMemberMock, findWorkspaceMemberIdByEmailMock } =
  vi.hoisted(() => ({
    getTeamsConversationMemberMock: vi.fn(),
    findWorkspaceMemberIdByEmailMock: vi.fn(),
  }));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-conversation-member',
  () => ({ getTeamsConversationMember: getTeamsConversationMemberMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/find-workspace-member-id-by-email',
  () => ({ findWorkspaceMemberIdByEmail: findWorkspaceMemberIdByEmailMock }),
);

const CLIENT = { query: vi.fn() };

const resolve = () =>
  resolveTeamsSenderWorkspaceMemberId({
    client: CLIENT,
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    conversationId: 'a:personal-conversation',
    teamsUserId: '29:user-id',
    accessToken: 'connector-access-token',
  });

describe('resolveTeamsSenderWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('workspace-member-id');
  });

  it('should match the sender to a workspace member by email', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({
      id: '29:user-id',
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
      userPrincipalName: 'jane@acme.com',
    });

    expect(await resolve()).toBe('workspace-member-id');
    expect(findWorkspaceMemberIdByEmailMock).toHaveBeenCalledWith({
      client: CLIENT,
      email: 'jane@acme.com',
    });
  });

  it('should not look up a member when the sender has no email at all', async () => {
    getTeamsConversationMemberMock.mockResolvedValue({ id: '29:user-id' });

    expect(await resolve()).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });
});
