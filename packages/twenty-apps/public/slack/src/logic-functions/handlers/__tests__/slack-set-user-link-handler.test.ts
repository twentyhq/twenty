import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSetUserLinkHandler } from 'src/logic-functions/handlers/slack-set-user-link-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  coreApiClientMock,
  getSlackClientMock,
  authTestMock,
  findSlackUserLinkMock,
  createSlackUserLinkMock,
  updateSlackUserLinkMock,
  resolveSlackUserByEmailMock,
  fetchSlackUserIdentityMock,
  findWorkspaceMemberNameByIdMock,
  sendSlackUserLinkConsentDmMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  resolveSlackUserByEmailMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  findWorkspaceMemberNameByIdMock: vi.fn(),
  sendSlackUserLinkConsentDmMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/current-user-has-workspace-members-permission',
  () => ({
    currentUserHasWorkspaceMembersPermission:
      currentUserHasWorkspaceMembersPermissionMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-user-by-email', () => ({
  resolveSlackUserByEmail: resolveSlackUserByEmailMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/update-slack-user-link', () => ({
  updateSlackUserLink: updateSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-name-by-id', () => ({
  findWorkspaceMemberNameById: findWorkspaceMemberNameByIdMock,
}));

vi.mock('src/logic-functions/utils/send-slack-user-link-consent-dm', () => ({
  sendSlackUserLinkConsentDm: sendSlackUserLinkConsentDmMock,
}));

const INSTALLED_TEAM_ID = 'T0123456789';

// A Slack user in the installed workspace: linking asks them to consent first.
const INPUT = {
  slackUserId: 'U0123456789',
  workspaceMemberId: 'workspace-member-1',
};

describe('slackSetUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
    findSlackUserLinkMock.mockResolvedValue(undefined);
    createSlackUserLinkMock.mockResolvedValue('link-new');
    // A directly-supplied id resolves to the installed team by default (a normal
    // in-workspace user); tests override this for cross-workspace or failure.
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: INPUT.slackUserId,
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: undefined,
    });
    findWorkspaceMemberNameByIdMock.mockResolvedValue('Ada Member');
    sendSlackUserLinkConsentDmMock.mockResolvedValue({ success: true });
  });

  it('should refuse when the triggering person lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should refuse when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail without creating when the link lookup errors', async () => {
    findSlackUserLinkMock.mockRejectedValue(new Error('GraphQL error'));

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GraphQL error');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should write the link with the application access', async () => {
    await slackSetUserLinkHandler(INPUT);

    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
  });

  it('should fail with a structured result when the write errors', async () => {
    createSlackUserLinkMock.mockRejectedValueOnce(new Error('write refused'));

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(result.error).toBe('write refused');
  });

  it('should create a pending link and send a consent request for an in-workspace user', async () => {
    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      slackTeamId: INSTALLED_TEAM_ID,
      slackUserId: INPUT.slackUserId,
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
    expect(sendSlackUserLinkConsentDmMock).toHaveBeenCalledTimes(1);
    expect(sendSlackUserLinkConsentDmMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackUserId: INPUT.slackUserId,
        slackTeamId: INSTALLED_TEAM_ID,
        workspaceMemberId: INPUT.workspaceMemberId,
        slackUserLinkId: 'link-new',
        memberName: 'Ada Member',
      }),
    );
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should still succeed as pending when the consent request cannot be delivered', async () => {
    sendSlackUserLinkConsentDmMock.mockResolvedValue({
      success: false,
      error: 'channel_not_found',
    });

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Resend');
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ consentState: 'PENDING' }),
    );
  });

  it('should admin-set the link without consent for a Slack Connect user from another workspace', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      slackTeamId: 'T9876543210',
    });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackTeamId: 'T9876543210',
        consentState: 'ADMIN_SET',
      }),
    );
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should fail closed when the installed workspace cannot be verified', async () => {
    authTestMock.mockResolvedValue({});

    const result = await slackSetUserLinkHandler({
      ...INPUT,
      slackTeamId: 'T9876543210',
    });

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should fail closed when an id-only user cannot be resolved to a workspace', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue(undefined);

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should fail closed when the identity lookup omits the team id', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: INPUT.slackUserId,
      slackTeamId: undefined,
      displayName: 'Ada Lovelace',
    });

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should admin-set a cross-workspace user given by id without a team id', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: INPUT.slackUserId,
      slackTeamId: 'T-EXTERNAL',
      displayName: 'Guest',
    });

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackTeamId: 'T-EXTERNAL',
        consentState: 'ADMIN_SET',
      }),
    );
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should require a Slack connection even when a team id is provided', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackSetUserLinkHandler({
      ...INPUT,
      slackTeamId: 'T9876543210',
    });

    expect(result.success).toBe(false);
    expect(getSlackClientMock).toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should update the existing link, mark it manual and reset it to pending', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'someone-else',
      source: 'AUTO',
      consentState: 'ACTIVE',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should keep an already-active link active when re-linking the same member', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      source: 'MANUAL',
      consentState: 'ACTIVE',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
      consentState: undefined,
    });
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should respect a decline and not re-request consent when re-linking the same member', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      source: 'MANUAL',
      consentState: 'DECLINED',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
      consentState: undefined,
    });
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should re-request consent when linking a declined user to a different member', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'someone-else',
      source: 'MANUAL',
      consentState: 'DECLINED',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'link-1',
        workspaceMemberId: INPUT.workspaceMemberId,
        consentState: 'PENDING',
      }),
    );
    expect(sendSlackUserLinkConsentDmMock).toHaveBeenCalled();
  });

  it('should not re-send a consent request when re-saving a still-pending same-member link', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      source: 'MANUAL',
      consentState: 'PENDING',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ consentState: undefined }),
    );
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should read the input from the route payload body', async () => {
    const result = await slackSetUserLinkHandler({
      body: { ...INPUT, name: 'Ada' },
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      isBase64Encoded: false,
      requestContext: {
        http: { method: 'POST', path: '/s/slack-user-links/set' },
      },
      userWorkspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackUserId: INPUT.slackUserId,
        workspaceMemberId: INPUT.workspaceMemberId,
        name: 'Ada',
        source: 'MANUAL',
      }),
    );
  });

  it('should fail closed when required fields are blank', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      workspaceMemberId: '',
    });

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should require a Slack email or a Slack user id', async () => {
    const result = await slackSetUserLinkHandler({
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should resolve the Slack user by email when no user id is given', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U9999999999',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });

    const result = await slackSetUserLinkHandler({
      email: 'ada@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(true);
    expect(resolveSlackUserByEmailMock).toHaveBeenCalledWith(
      expect.anything(),
      'ada@example.com',
    );
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      slackTeamId: INSTALLED_TEAM_ID,
      slackUserId: 'U9999999999',
      workspaceMemberId: 'workspace-member-1',
      name: 'Ada Lovelace',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
  });

  it('should fail with a helpful error when the email is not in the workspace', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue(undefined);

    const result = await slackSetUserLinkHandler({
      email: 'guest@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Slack user id');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail with a structured error when the email lookup throws', async () => {
    resolveSlackUserByEmailMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackSetUserLinkHandler({
      email: 'ada@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('ratelimited');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should prefer the Slack user id over the email when both are given', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      email: 'ada@example.com',
    });

    expect(result.success).toBe(true);
    expect(resolveSlackUserByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackUserId: INPUT.slackUserId }),
    );
  });
});
