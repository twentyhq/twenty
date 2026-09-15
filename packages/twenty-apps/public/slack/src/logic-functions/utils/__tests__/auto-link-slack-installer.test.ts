import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { autoLinkSlackInstaller } from 'src/logic-functions/utils/auto-link-slack-installer';

const {
  coreApiClientMock,
  findWorkspaceMemberEmailByIdMock,
  resolveSlackUserByEmailMock,
  findSlackUserLinkMock,
  persistSlackUserLinkMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  findWorkspaceMemberEmailByIdMock: vi.fn(),
  resolveSlackUserByEmailMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  persistSlackUserLinkMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-email-by-id', () => ({
  findWorkspaceMemberEmailById: findWorkspaceMemberEmailByIdMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-user-by-email', () => ({
  resolveSlackUserByEmail: resolveSlackUserByEmailMock,
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/utils/persist-slack-user-link', () => ({
  persistSlackUserLink: persistSlackUserLinkMock,
}));

const slackClient = {} as WebClient;

const INSTALLED_TEAM_ID = 'T-installed';
const MEMBER_ID = 'member-1';

describe('autoLinkSlackInstaller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findWorkspaceMemberEmailByIdMock.mockResolvedValue('ada@twenty.com');
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U-installer',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada',
      isRegularUserAccount: true,
    });
    findSlackUserLinkMock.mockResolvedValue(undefined);
    persistSlackUserLinkMock.mockResolvedValue('link-new');
  });

  it('should do nothing without a connecting workspace member', async () => {
    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: null,
    });

    expect(findWorkspaceMemberEmailByIdMock).not.toHaveBeenCalled();
    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the member has no readable email', async () => {
    findWorkspaceMemberEmailByIdMock.mockResolvedValue(undefined);

    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(resolveSlackUserByEmailMock).not.toHaveBeenCalled();
    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should do nothing when no Slack account matches the email', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue(undefined);

    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not link a restricted account', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U-guest',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Guest',
      isRegularUserAccount: false,
    });

    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should leave an existing link for the account untouched', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-existing',
      workspaceMemberId: 'member-other',
      source: 'MANUAL',
      consentState: 'DECLINED',
    });

    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should create an active auto link for the installer', async () => {
    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(persistSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      existingLink: undefined,
      isSameMemberRelink: false,
      slackTeamId: INSTALLED_TEAM_ID,
      slackUserId: 'U-installer',
      workspaceMemberId: MEMBER_ID,
      name: 'Ada',
      source: 'AUTO',
      consentState: 'ACTIVE',
    });
  });

  it('should keep the lookup team when it differs from the connection team', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U-installer',
      slackTeamId: 'T-enterprise-leaf',
      displayName: 'Ada',
      isRegularUserAccount: true,
    });

    await autoLinkSlackInstaller({
      slackClient,
      slackTeamId: INSTALLED_TEAM_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(findSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      slackTeamId: 'T-enterprise-leaf',
      slackUserId: 'U-installer',
    });
    expect(persistSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackTeamId: 'T-enterprise-leaf' }),
    );
  });
});
