import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackRosterMatchCandidate } from 'src/logic-functions/types/slack-roster-match.type';
import { linkSlackRosterCandidates } from 'src/logic-functions/utils/link-slack-roster-candidates';

const {
  createSlackUserLinksMock,
  destroySlackUserLinksMock,
  findDeletedSlackUserLinkIdsMock,
  listLinkedSlackUserIdsMock,
  createSlackUserLinkMock,
} = vi.hoisted(() => ({
  createSlackUserLinksMock: vi.fn(),
  destroySlackUserLinksMock: vi.fn(),
  findDeletedSlackUserLinkIdsMock: vi.fn(),
  listLinkedSlackUserIdsMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/create-slack-user-links', () => ({
  createSlackUserLinks: createSlackUserLinksMock,
}));

vi.mock('src/logic-functions/data/destroy-slack-user-links', () => ({
  destroySlackUserLinks: destroySlackUserLinksMock,
}));

vi.mock('src/logic-functions/data/find-deleted-slack-user-link-ids', () => ({
  findDeletedSlackUserLinkIds: findDeletedSlackUserLinkIdsMock,
}));

vi.mock('src/logic-functions/data/list-linked-slack-user-ids', () => ({
  listLinkedSlackUserIds: listLinkedSlackUserIdsMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));

const SLACK_TEAM_ID = 'T-installed';
const client = {} as CoreApiClient;

const candidate = (
  slackUserId: string,
  displayName?: string,
): SlackRosterMatchCandidate => ({
  slackUserId,
  workspaceMemberId: `member-${slackUserId}`,
  displayName,
});

describe('linkSlackRosterCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findDeletedSlackUserLinkIdsMock.mockResolvedValue([]);
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set());
    createSlackUserLinkMock.mockResolvedValue('link-new');
  });

  it('should create every candidate in one call', async () => {
    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1', 'Ada'), candidate('U2', 'Grace')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock).toHaveBeenCalledTimes(1);
    expect(createSlackUserLinksMock).toHaveBeenCalledWith(client, {
      drafts: [
        {
          slackTeamId: SLACK_TEAM_ID,
          slackUserId: 'U1',
          workspaceMemberId: 'member-U1',
          name: 'Ada',
          source: 'AUTO',
          consentState: 'ACTIVE',
        },
        {
          slackTeamId: SLACK_TEAM_ID,
          slackUserId: 'U2',
          workspaceMemberId: 'member-U2',
          name: 'Grace',
          source: 'AUTO',
          consentState: 'ACTIVE',
        },
      ],
    });
    expect(outcome).toEqual({ linkedCount: 2, failedCount: 0 });
  });

  it('should fall back to the Slack user id when the roster has no display name', async () => {
    await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock.mock.calls[0][1].drafts[0].name).toBe('U1');
  });

  it('should clear a soft-deleted link before creating', async () => {
    findDeletedSlackUserLinkIdsMock.mockResolvedValue(['deleted-link']);

    await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(findDeletedSlackUserLinkIdsMock).toHaveBeenCalledWith(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1'],
    });
    expect(destroySlackUserLinksMock).toHaveBeenCalledWith(client, {
      ids: ['deleted-link'],
    });
  });

  it('should not call destroy when nothing was soft-deleted', async () => {
    await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(destroySlackUserLinksMock).not.toHaveBeenCalled();
  });

  it('should touch nothing when there is no candidate', async () => {
    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(findDeletedSlackUserLinkIdsMock).not.toHaveBeenCalled();
    expect(createSlackUserLinksMock).not.toHaveBeenCalled();
    expect(outcome).toEqual({ linkedCount: 0, failedCount: 0 });
  });

  it('should link one at a time and count the failure when the batch fails', async () => {
    createSlackUserLinksMock.mockRejectedValue(new Error('batch failed'));
    createSlackUserLinkMock
      .mockRejectedValueOnce(new Error('write failed'))
      .mockResolvedValueOnce('link-new');

    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1'), candidate('U2')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(2);
    expect(outcome).toEqual({ linkedCount: 1, failedCount: 1 });
  });

  it('should count candidates the failed batch already wrote as linked, not failed', async () => {
    createSlackUserLinksMock.mockRejectedValue(new Error('batch failed'));
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set(['U1']));

    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1'), candidate('U2')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ slackUserId: 'U2' }),
    );
    expect(outcome).toEqual({ linkedCount: 2, failedCount: 0 });
  });

  it('should stop retrying one at a time once a second batch fails', async () => {
    createSlackUserLinksMock.mockRejectedValue(new Error('batch failed'));
    createSlackUserLinkMock.mockRejectedValue(new Error('write failed'));

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock).toHaveBeenCalledTimes(2);
    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(200);
    expect(outcome).toEqual({ linkedCount: 0, failedCount: 400 });
  });

  it('should keep the one-at-a-time budget when the first batches succeed', async () => {
    createSlackUserLinksMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('batch failed'));

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(200);
    expect(outcome).toEqual({ linkedCount: 400, failedCount: 0 });
  });

  it('should count rows a given-up batch already wrote as linked', async () => {
    createSlackUserLinksMock.mockRejectedValue(new Error('batch failed'));
    createSlackUserLinkMock.mockRejectedValue(new Error('write failed'));
    listLinkedSlackUserIdsMock.mockImplementation(
      async (_client, { slackUserIds }) =>
        new Set(
          slackUserIds.filter((slackUserId: string) => slackUserId === 'U399'),
        ),
    );

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(200);
    expect(outcome).toEqual({ linkedCount: 1, failedCount: 399 });
  });

  it('should keep earlier batches when the reconciliation read fails', async () => {
    createSlackUserLinksMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('batch failed'));
    listLinkedSlackUserIdsMock.mockRejectedValue(new Error('read failed'));

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(outcome).toEqual({ linkedCount: 200, failedCount: 200 });
  });

  it('should write a Slack user repeated by the roster only once', async () => {
    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1', 'Ada'), candidate('U1', 'Ada')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock.mock.calls[0][1].drafts).toHaveLength(1);
    expect(findDeletedSlackUserLinkIdsMock).toHaveBeenCalledWith(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1'],
    });
    expect(outcome).toEqual({ linkedCount: 1, failedCount: 0 });
  });

  it('should clear soft-deleted links per batch, not for the whole set up front', async () => {
    findDeletedSlackUserLinkIdsMock.mockResolvedValue(['deleted-link']);

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(findDeletedSlackUserLinkIdsMock).toHaveBeenCalledTimes(2);
    expect(
      findDeletedSlackUserLinkIdsMock.mock.calls[0][1].slackUserIds,
    ).toHaveLength(200);
    expect(destroySlackUserLinksMock).toHaveBeenCalledTimes(2);
  });

  it('should not attempt creates or spend the retry budget when the cleanup fails', async () => {
    findDeletedSlackUserLinkIdsMock
      .mockRejectedValueOnce(new Error('cleanup failed'))
      .mockResolvedValue([]);
    createSlackUserLinksMock.mockRejectedValueOnce(new Error('batch failed'));

    const candidates = Array.from({ length: 400 }, (_, index) =>
      candidate(`U${index}`),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock).toHaveBeenCalledTimes(1);
    expect(createSlackUserLinkMock).toHaveBeenCalledTimes(200);
    expect(outcome).toEqual({ linkedCount: 200, failedCount: 200 });
  });

  it('should credit a concurrent sweep when the cleanup fails', async () => {
    findDeletedSlackUserLinkIdsMock.mockRejectedValue(
      new Error('cleanup failed'),
    );
    listLinkedSlackUserIdsMock.mockImplementation(
      async (_client, { slackUserIds }) =>
        new Set(
          slackUserIds.filter((slackUserId: string) => slackUserId === 'U1'),
        ),
    );

    const outcome = await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1'), candidate('U2')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(outcome).toEqual({ linkedCount: 1, failedCount: 1 });
  });

  it('should never upsert, so a declined or manual link is never overwritten', async () => {
    await linkSlackRosterCandidates(client, {
      candidates: [candidate('U1')],
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(createSlackUserLinksMock.mock.calls[0][1]).not.toHaveProperty(
      'upsert',
    );
  });
});
