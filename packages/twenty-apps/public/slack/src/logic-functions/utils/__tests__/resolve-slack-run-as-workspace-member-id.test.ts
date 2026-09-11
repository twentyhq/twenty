import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const {
  findSlackUserLinksBySlackUserIdsMock,
  findWorkspaceMemberIdsByEmailsMock,
  createSlackUserLinkMock,
  updateSlackUserLinkMock,
  coreApiClientMock,
  applicationClient,
} = vi.hoisted(() => ({
  findSlackUserLinksBySlackUserIdsMock: vi.fn(),
  findWorkspaceMemberIdsByEmailsMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  applicationClient: {},
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/logic-functions/data/find-slack-user-links-by-slack-user-ids',
  () => ({
    findSlackUserLinksBySlackUserIds: findSlackUserLinksBySlackUserIdsMock,
  }),
);

vi.mock('src/logic-functions/data/find-workspace-member-ids-by-emails', () => ({
  findWorkspaceMemberIdsByEmails: findWorkspaceMemberIdsByEmailsMock,
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

const link = (
  overrides: Partial<SlackUserLinkSummary> = {},
): SlackUserLinkSummary => ({
  id: 'link-1',
  slackUserId: IDENTITY.slackUserId,
  slackTeamId: 'T0INSTALLED',
  name: 'ada',
  workspaceMemberId: 'member-1',
  source: 'MANUAL',
  consentState: 'ACTIVE',
  ...overrides,
});

const givenStoredLink = (overrides: Partial<SlackUserLinkSummary> = {}) =>
  findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
    new Map([[IDENTITY.slackUserId, link(overrides)]]),
  );

const givenEmailMatches = (workspaceMemberId: string | undefined) =>
  findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
    workspaceMemberIdByEmail:
      workspaceMemberId === undefined
        ? new Map()
        : new Map([['ada@twenty.com', workspaceMemberId]]),
    ambiguousEmailCount: 0,
  });

const expectNoEmailMatchConsulted = () =>
  expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith(client, {
    emails: [],
  });

const runAs = (identity: SlackUserIdentity = IDENTITY) =>
  resolveSlackRunAsWorkspaceMemberId({ client, slackClient, identity });

describe('resolveSlackRunAsWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(new Map());
    givenEmailMatches(undefined);
    createSlackUserLinkMock.mockResolvedValue(undefined);
    updateSlackUserLinkMock.mockResolvedValue(undefined);
    coreApiClientMock.mockImplementation(function () {
      return applicationClient;
    });
    authTestMock.mockResolvedValue({ team_id: 'T0INSTALLED' });
  });

  it('should honor a manual link without consulting the email match', async () => {
    givenStoredLink();

    expect(await runAs()).toBe('member-1');
    expectNoEmailMatchConsulted();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not run as anyone when a manual link has no workspace member', async () => {
    givenStoredLink({ workspaceMemberId: undefined });
    givenEmailMatches('member-1');

    expect(await runAs()).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should prefer the manual link over a disagreeing email match, without touching it', async () => {
    givenStoredLink({ workspaceMemberId: 'member-2' });
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-2');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should keep honoring a legacy manual link that predates the consent field', async () => {
    givenStoredLink({ consentState: undefined });

    expect(await runAs()).toBe('member-1');
    expectNoEmailMatchConsulted();
  });

  it('should treat an admin-set manual link as consented', async () => {
    givenStoredLink({ consentState: 'ADMIN_SET' });

    expect(await runAs()).toBe('member-1');
    expectNoEmailMatchConsulted();
  });

  it('should fall through to the email match for a pending manual link, without touching it', async () => {
    givenStoredLink({ workspaceMemberId: 'member-2', consentState: 'PENDING' });
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-1');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should still grant the member their own email match after a declined manual link to another member', async () => {
    // Declining a link that lends another member's access must not cost the
    // Slack user their own identity: run-as still resolves their own member by
    // email, and never re-creates or re-updates the link.
    givenStoredLink({
      workspaceMemberId: 'member-2',
      consentState: 'DECLINED',
    });
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-1');
    expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith(client, {
      emails: ['ada@twenty.com'],
    });
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not fall back to a declined manual link when the user has no own email match', async () => {
    givenStoredLink({
      workspaceMemberId: 'member-2',
      consentState: 'DECLINED',
    });
    givenEmailMatches(undefined);

    expect(await runAs()).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should honor a matched link when the live email match still agrees', async () => {
    givenStoredLink({ source: 'AUTO' });
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-1');
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should follow the live email match over a matched link that disagrees, and heal the link', async () => {
    givenStoredLink({ source: 'AUTO', workspaceMemberId: 'member-victim' });
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-1');
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(applicationClient, {
      id: 'link-1',
      workspaceMemberId: 'member-1',
    });
  });

  it('should fall back to the agent role when a matched link can no longer be re-verified', async () => {
    givenStoredLink({ source: 'AUTO' });
    givenEmailMatches(undefined);

    expect(await runAs()).toBeUndefined();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not honor a matched link when the account is no longer a regular user', async () => {
    givenStoredLink({ source: 'AUTO' });

    expect(
      await runAs({ ...IDENTITY, isRegularUserAccount: false }),
    ).toBeUndefined();
    expectNoEmailMatchConsulted();
  });

  it('should not match on email when the Slack account is a bot or guest', async () => {
    expect(
      await runAs({ ...IDENTITY, isRegularUserAccount: false }),
    ).toBeUndefined();
    expectNoEmailMatchConsulted();
  });

  it('should store the link when the email matches a single member', async () => {
    givenEmailMatches('member-1');

    expect(await runAs()).toBe('member-1');
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
    givenEmailMatches('member-1');
    createSlackUserLinkMock.mockRejectedValue(new Error('duplicate key'));

    expect(await runAs()).toBe('member-1');
  });

  it('should refuse run-as when the link lookup throws, since a manual link may exist', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockRejectedValue(
      new Error('permission denied'),
    );
    givenEmailMatches('member-1');

    expect(await runAs()).toBeUndefined();
    expect(findWorkspaceMemberIdsByEmailsMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not link a Slack Connect user from another workspace', async () => {
    givenEmailMatches('member-1');

    expect(
      await runAs({ ...IDENTITY, slackTeamId: 'T0EXTERNAL' }),
    ).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should read the installing team from the live connection on every run', async () => {
    givenEmailMatches('member-1');

    await runAs();

    expect(authTestMock).toHaveBeenCalled();
  });

  it('should not link when the installing team cannot be read', async () => {
    givenEmailMatches('member-1');
    authTestMock.mockRejectedValue(new Error('invalid_auth'));

    expect(await runAs()).toBeUndefined();
  });
});
