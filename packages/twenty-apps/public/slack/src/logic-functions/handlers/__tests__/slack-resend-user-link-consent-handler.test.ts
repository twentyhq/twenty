import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackResendUserLinkConsentHandler } from 'src/logic-functions/handlers/slack-resend-user-link-consent-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  coreApiClientMock,
  findSlackUserLinkMock,
  findWorkspaceMemberNameByIdMock,
  getSlackClientMock,
  sendSlackUserLinkConsentDmMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  findWorkspaceMemberNameByIdMock: vi.fn(),
  getSlackClientMock: vi.fn(),
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

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-name-by-id', () => ({
  findWorkspaceMemberNameById: findWorkspaceMemberNameByIdMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/send-slack-user-link-consent-dm', () => ({
  sendSlackUserLinkConsentDm: sendSlackUserLinkConsentDmMock,
}));

const buildPayload = (body: unknown) => ({ body });

const PENDING_BODY = { slackTeamId: 'T1', slackUserId: 'U1' };

describe('slackResendUserLinkConsentHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'member-1',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
    findWorkspaceMemberNameByIdMock.mockResolvedValue('Ada Member');
    getSlackClientMock.mockResolvedValue({ success: true, client: {} });
    sendSlackUserLinkConsentDmMock.mockResolvedValue({ success: true });
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(false);
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should fail closed when identity fields are missing', async () => {
    const result = await slackResendUserLinkConsentHandler(
      buildPayload({ slackTeamId: 'T1' }),
    );

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
  });

  it('should fail when there is no link to resend', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);

    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(false);
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should refuse to resend for a link that is not pending', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'member-1',
      source: 'MANUAL',
      consentState: 'ACTIVE',
    });

    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(false);
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should resend the consent request for a pending link', async () => {
    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(true);
    expect(sendSlackUserLinkConsentDmMock).toHaveBeenCalledTimes(1);
    expect(sendSlackUserLinkConsentDmMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackTeamId: 'T1',
        slackUserId: 'U1',
        workspaceMemberId: 'member-1',
        memberName: 'Ada Member',
      }),
    );
  });

  it('should fail when the pending link has no workspace member assigned', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: '',
      source: 'MANUAL',
      consentState: 'PENDING',
    });

    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(false);
    expect(sendSlackUserLinkConsentDmMock).not.toHaveBeenCalled();
  });

  it('should report a delivery failure', async () => {
    sendSlackUserLinkConsentDmMock.mockResolvedValue({
      success: false,
      error: 'channel_not_found',
    });

    const result = await slackResendUserLinkConsentHandler(
      buildPayload(PENDING_BODY),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('channel_not_found');
  });
});
