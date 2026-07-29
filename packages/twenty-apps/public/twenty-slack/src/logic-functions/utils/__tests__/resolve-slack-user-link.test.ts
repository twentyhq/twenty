import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackUserLink } from 'src/logic-functions/utils/resolve-slack-user-link';

const {
  createSlackUserLinkMock,
  fetchSlackUserEmailMock,
  findSlackUserLinkMock,
  findWorkspaceMemberByEmailMock,
} = vi.hoisted(() => ({
  createSlackUserLinkMock: vi.fn(),
  fetchSlackUserEmailMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  findWorkspaceMemberByEmailMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));
vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));
vi.mock('src/logic-functions/data/find-workspace-member-by-email', () => ({
  findWorkspaceMemberByEmail: findWorkspaceMemberByEmailMock,
}));
vi.mock('src/logic-functions/utils/fetch-slack-user-email', () => ({
  fetchSlackUserEmail: fetchSlackUserEmailMock,
}));

const client = {} as CoreApiClient;

describe('resolveSlackUserLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should return the existing link without calling Slack', async () => {
    findSlackUserLinkMock.mockResolvedValue({ workspaceMemberId: 'member-1' });

    const result = await resolveSlackUserLink(client, {
      slackUserId: 'U1',
    });

    expect(result).toEqual({ workspaceMemberId: 'member-1' });
    expect(fetchSlackUserEmailMock).not.toHaveBeenCalled();
  });

  it('should create the link when the Slack email matches a member', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);
    fetchSlackUserEmailMock.mockResolvedValue('member@example.com');
    findWorkspaceMemberByEmailMock.mockResolvedValue('member-1');

    const result = await resolveSlackUserLink(client, {
      slackUserId: 'U1',
    });

    expect(result).toEqual({ workspaceMemberId: 'member-1' });
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(client, {
      slackUserId: 'U1',
      workspaceMemberId: 'member-1',
    });
  });

  it('should stay unresolved when no member matches the Slack email', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);
    fetchSlackUserEmailMock.mockResolvedValue('stranger@example.com');
    findWorkspaceMemberByEmailMock.mockResolvedValue(undefined);

    const result = await resolveSlackUserLink(client, {
      slackUserId: 'U1',
    });

    expect(result).toBeUndefined();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should stay unresolved when Slack does not expose an email', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);
    fetchSlackUserEmailMock.mockResolvedValue(undefined);

    const result = await resolveSlackUserLink(client, {
      slackUserId: 'U1',
    });

    expect(result).toBeUndefined();
    expect(findWorkspaceMemberByEmailMock).not.toHaveBeenCalled();
  });

  it('should still resolve when a concurrent event already created the link', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);
    fetchSlackUserEmailMock.mockResolvedValue('member@example.com');
    findWorkspaceMemberByEmailMock.mockResolvedValue('member-1');
    createSlackUserLinkMock.mockRejectedValue(new Error('duplicate key'));

    const result = await resolveSlackUserLink(client, {
      slackUserId: 'U1',
    });

    expect(result).toEqual({ workspaceMemberId: 'member-1' });
  });

  it('should stay unresolved when there is no Slack user id', async () => {
    const result = await resolveSlackUserLink(client, {
      slackUserId: undefined,
    });

    expect(result).toBeUndefined();
    expect(findSlackUserLinkMock).not.toHaveBeenCalled();
  });
});
