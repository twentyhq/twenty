import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';

const SLACK_TEAM_ID = 'T0INSTALLED';
const SLACK_USER_ID = 'U0123456789';

const queryMock = vi.fn();

const client = { query: queryMock } as unknown as CoreApiClient;

const buildQueryResult = (node: Record<string, unknown> | undefined) => ({
  slackUserLinks: { edges: node === undefined ? [] : [{ node }] },
});

const buildNode = (overrides: Record<string, unknown> = {}) => ({
  id: 'link-1',
  workspaceMemberId: 'member-1',
  source: 'MANUAL',
  consentState: 'ACTIVE',
  ...overrides,
});

const find = () =>
  findSlackUserLink(client, {
    slackTeamId: SLACK_TEAM_ID,
    slackUserId: SLACK_USER_ID,
  });

describe('findSlackUserLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(buildQueryResult(buildNode()));
  });

  it('should return the stored link', async () => {
    expect(await find()).toEqual({
      id: 'link-1',
      workspaceMemberId: 'member-1',
      source: 'MANUAL',
      consentState: 'ACTIVE',
    });
  });

  it('should return undefined when the Slack account has no link', async () => {
    queryMock.mockResolvedValue(buildQueryResult(undefined));

    expect(await find()).toBeUndefined();
  });

  it('should keep a link written before consent existed readable', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult(buildNode({ consentState: null })),
    );

    expect(await find()).toMatchObject({ consentState: undefined });
  });

  it('should refuse a consent state it cannot interpret rather than reading it as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult(buildNode({ consentState: 'REVOKED' })),
    );

    await expect(find()).rejects.toThrow(
      'Slack user link link-1 has an unsupported consentState "REVOKED"',
    );
  });

  it('should refuse a source it cannot interpret', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult(buildNode({ source: 'IMPORTED' })),
    );

    await expect(find()).rejects.toThrow(
      'Slack user link link-1 has an unsupported source "IMPORTED"',
    );
  });
});
