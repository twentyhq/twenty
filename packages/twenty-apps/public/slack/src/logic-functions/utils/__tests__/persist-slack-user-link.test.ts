import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';

const {
  createSlackUserLinkMock,
  destroySlackUserLinkMock,
  updateSlackUserLinkMock,
  findDeletedSlackUserLinkIdsMock,
} = vi.hoisted(() => ({
  createSlackUserLinkMock: vi.fn(),
  destroySlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  findDeletedSlackUserLinkIdsMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/destroy-slack-user-link', () => ({
  destroySlackUserLink: destroySlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/update-slack-user-link', () => ({
  updateSlackUserLink: updateSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/find-deleted-slack-user-link-ids', () => ({
  findDeletedSlackUserLinkIds: findDeletedSlackUserLinkIdsMock,
}));

const SLACK_TEAM_ID = 'T0INSTALLED';
const SLACK_USER_ID = 'U0123456789';
const WORKSPACE_MEMBER_ID = 'member-1';

const client = {} as CoreApiClient;

const existingLink: SlackUserLink = {
  id: 'link-1',
  workspaceMemberId: WORKSPACE_MEMBER_ID,
  source: 'MANUAL',
  consentState: 'DECLINED',
};

const persist = (
  overrides: Partial<Parameters<typeof persistSlackUserLink>[1]> = {},
) =>
  persistSlackUserLink(client, {
    existingLink: undefined,
    isSameMemberRelink: false,
    slackTeamId: SLACK_TEAM_ID,
    slackUserId: SLACK_USER_ID,
    workspaceMemberId: WORKSPACE_MEMBER_ID,
    name: 'Ada Lovelace',
    source: 'MANUAL',
    consentState: 'PENDING',
    ...overrides,
  });

describe('persistSlackUserLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSlackUserLinkMock.mockResolvedValue('link-new');
    destroySlackUserLinkMock.mockResolvedValue(undefined);
    updateSlackUserLinkMock.mockResolvedValue(undefined);
    findDeletedSlackUserLinkIdsMock.mockResolvedValue([]);
  });

  it('should destroy a soft-deleted ghost holding the tuple before creating', async () => {
    findDeletedSlackUserLinkIdsMock.mockResolvedValue(['link-ghost']);

    expect(await persist()).toBe('link-new');

    expect(destroySlackUserLinkMock).toHaveBeenCalledWith(client, {
      id: 'link-ghost',
    });
    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(destroySlackUserLinkMock.mock.invocationCallOrder[0]).toBeLessThan(
      createSlackUserLinkMock.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('should not look for a ghost when replacing a live link', async () => {
    expect(await persist({ existingLink })).toBe('link-new');

    expect(findDeletedSlackUserLinkIdsMock).not.toHaveBeenCalled();
    expect(destroySlackUserLinkMock).toHaveBeenCalledWith(client, {
      id: existingLink.id,
    });
  });

  it('should create a link when the Slack account has none', async () => {
    expect(await persist()).toBe('link-new');

    expect(createSlackUserLinkMock).toHaveBeenCalledWith(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserId: SLACK_USER_ID,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      name: 'Ada Lovelace',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
  });

  it('should fall back to the Slack user id when no name was resolved', async () => {
    await persist({ name: undefined });

    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ name: SLACK_USER_ID }),
    );
  });

  it('should never rewrite consent when the same member is saved again', async () => {
    expect(
      await persist({
        existingLink,
        isSameMemberRelink: true,
        source: undefined,
        consentState: undefined,
      }),
    ).toBe('link-1');

    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(client, {
      id: 'link-1',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      name: 'Ada Lovelace',
      source: undefined,
      consentState: undefined,
    });
    expect(destroySlackUserLinkMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should replace the link when the Slack account moves to another member', async () => {
    expect(await persist({ existingLink, workspaceMemberId: 'member-2' })).toBe(
      'link-new',
    );

    expect(destroySlackUserLinkMock).toHaveBeenCalledWith(client, {
      id: 'link-1',
    });
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      client,
      expect.objectContaining({
        workspaceMemberId: 'member-2',
        consentState: 'PENDING',
      }),
    );
  });

  it('should refuse to create a link without an explicit source and consent state', async () => {
    await expect(persist({ consentState: undefined })).rejects.toThrow(
      'A new Slack user link needs an explicit source and consent state',
    );

    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(destroySlackUserLinkMock).not.toHaveBeenCalled();
  });
});
