import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const {
  findSlackUserLinkWorkspaceMemberIdMock,
  findWorkspaceMemberIdByEmailMock,
  createSlackUserLinkMock,
} = vi.hoisted(() => ({
  findSlackUserLinkWorkspaceMemberIdMock: vi.fn(),
  findWorkspaceMemberIdByEmailMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLinkWorkspaceMemberId: findSlackUserLinkWorkspaceMemberIdMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-id-by-email', () => ({
  findWorkspaceMemberIdByEmail: findWorkspaceMemberIdByEmailMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
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

describe('resolveSlackRunAsWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackUserLinkWorkspaceMemberIdMock.mockResolvedValue(undefined);
    findWorkspaceMemberIdByEmailMock.mockResolvedValue(undefined);
    createSlackUserLinkMock.mockResolvedValue(undefined);
    authTestMock.mockResolvedValue({ team_id: 'T0INSTALLED' });
  });

  it('should prefer the existing link over an email match', async () => {
    findSlackUserLinkWorkspaceMemberIdMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
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
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(client, {
      slackTeamId: 'T0INSTALLED',
      slackUserId: 'U0123456789',
      workspaceMemberId: 'member-1',
      name: 'ada',
    });
  });

  it('should defer to the winning link when a concurrent request created one', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');
    createSlackUserLinkMock.mockRejectedValue(new Error('duplicate key'));
    findSlackUserLinkWorkspaceMemberIdMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('member-2');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: IDENTITY,
      }),
    ).toBe('member-2');
  });

  it('should fall back to the agent role when the link lookup throws', async () => {
    findSlackUserLinkWorkspaceMemberIdMock.mockRejectedValue(
      new Error('permission denied'),
    );

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        slackClient,
        identity: { ...IDENTITY, isRegularUserAccount: false },
      }),
    ).toBeUndefined();
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

  it('should read the installing team from the live connection on every link', async () => {
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
