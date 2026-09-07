import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const {
  findSlackUserLinkMock,
  findWorkspaceMemberIdByEmailMock,
  createSlackUserLinkMock,
  updateSlackUserLinkMock,
  coreApiClientMock,
  applicationClient,
} = vi.hoisted(() => ({
  findSlackUserLinkMock: vi.fn(),
  findWorkspaceMemberIdByEmailMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  applicationClient: {},
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-id-by-email', () => ({
  findWorkspaceMemberIdByEmail: findWorkspaceMemberIdByEmailMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/update-slack-user-link', () => ({
  updateSlackUserLink: updateSlackUserLinkMock,
}));

const client = {} as CoreApiClient;

const authTestMock = vi.fn();
const slackClient = { auth: { test: authTestMock } } as unknown as WebClient;

const IDENTITY: SlackUserIdentity = {
  slackUserId: 'U0123456789',
  slackTeamId: 'T0INSTALLED',
  displayName: 'ada',
  email: 'ada@twenty.com',
  isRegularUserAccount: true,
};

const AUTO_LINK = {
  id: 'link-1',
  workspaceMemberId: 'member-1',
  source: 'AUTO',
  consentState: 'ACTIVE',
};

const MANUAL_LINK = {
  id: 'link-1',
  workspaceMemberId: 'member-1',
  source: 'MANUAL',
  consentState: 'ACTIVE',
};

describe('resolveSlackRunAsWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackUserLinkMock.mockResolvedValue(undefined);
    findWorkspaceMemberIdByEmailMock.mockResolvedValue(undefined);
    createSlackUserLinkMock.mockResolvedValue(undefined);
    updateSlackUserLinkMock.mockResolvedValue(undefined);
    coreApiClientMock.mockImplementation(function () {
      return applicationClient;
    });
    authTestMock.mockResolvedValue({ team_id: 'T0INSTALLED' });
  });

  it('should honor a manual link without consulting the email match', async () => {
    findSlackUserLinkMock.mockResolvedValue(MANUAL_LINK);

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not run as anyone when a manual link has no workspace member', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      workspaceMemberId: undefined,
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should prefer the manual link over a disagreeing email match, without touching it', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      workspaceMemberId: 'member-2',
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-2');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should keep honoring a legacy manual link that predates the consent field', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      consentState: undefined,
    });

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should treat an admin-set manual link as consented', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      consentState: 'ADMIN_SET',
    });

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should fall through to the email match for a pending manual link, without touching it', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      workspaceMemberId: 'member-2',
      consentState: 'PENDING',
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should still grant the member their own email match after a declined manual link to another member', async () => {
    // Declining a link that lends another member's access must not cost the
    // Slack user their own identity: once DECLINED is no longer an early
    // return, run-as still resolves their own member by email (which is all
    // their own permissions) and never re-creates or re-updates the link.
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      workspaceMemberId: 'member-2',
      consentState: 'DECLINED',
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).toHaveBeenCalledTimes(1);
    expect(findWorkspaceMemberIdByEmailMock).toHaveBeenCalledWith(
      client,
      'ada@twenty.com',
    );
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not fall back to a declined manual link when the user has no own email match', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...MANUAL_LINK,
      workspaceMemberId: 'member-2',
      consentState: 'DECLINED',
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue(undefined);

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should honor a matched link when the live email match still agrees', async () => {
    findSlackUserLinkMock.mockResolvedValue(AUTO_LINK);
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should follow the live email match over a matched link that disagrees, and heal the link', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      ...AUTO_LINK,
      workspaceMemberId: 'member-victim',
    });
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(applicationClient, {
      id: 'link-1',
      workspaceMemberId: 'member-1',
    });
  });

  it('should fall back to the agent role when a matched link can no longer be re-verified', async () => {
    findSlackUserLinkMock.mockResolvedValue(AUTO_LINK);
    findWorkspaceMemberIdByEmailMock.mockResolvedValue(undefined);

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBeUndefined();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not honor a matched link when the account is no longer a regular user', async () => {
    findSlackUserLinkMock.mockResolvedValue(AUTO_LINK);

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: { ...IDENTITY, isRegularUserAccount: false },
      }),
    ).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should not match on email when the Slack account is a bot or guest', async () => {
    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: { ...IDENTITY, isRegularUserAccount: false },
      }),
    ).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should store the link when the email matches a single member', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(applicationClient, {
      slackTeamId: 'T0INSTALLED',
      slackUserId: 'U0123456789',
      workspaceMemberId: 'member-1',
      name: 'ada',
      source: 'AUTO',
      consentState: 'ACTIVE',
    });
  });

  it('should still act on its own match when a concurrent request won the link race', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');
    createSlackUserLinkMock.mockRejectedValue(new Error('duplicate key'));

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
  });

  it('should refuse run-as when the link lookup throws, since a manual link may exist', async () => {
    findSlackUserLinkMock.mockRejectedValue(new Error('permission denied'));
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not link a Slack Connect user from another workspace', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: { ...IDENTITY, slackTeamId: 'T0EXTERNAL' },
      }),
    ).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should read the installing team from the live connection on every run', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    await resolveSlackRunAsWorkspaceMemberId({
      client,
      slackClient,
      identity: IDENTITY,
    });

    expect(authTestMock).toHaveBeenCalled();
  });

  it('should not link when the installing team cannot be read', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');
    authTestMock.mockRejectedValue(new Error('invalid_auth'));

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBeUndefined();
  });
});
