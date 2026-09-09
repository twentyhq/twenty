import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackUserLinksBySlackUserIds } from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';

const SLACK_TEAM_ID = 'T0INSTALLED';

const queryMock = vi.fn();

const client = { query: queryMock } as unknown as CoreApiClient;

const buildQueryResult = (nodes: Record<string, unknown>[]) => ({
  slackUserLinks: { edges: nodes.map((node) => ({ node })) },
});

const buildNode = (overrides: Record<string, unknown> = {}) => ({
  id: 'link-1',
  slackUserId: 'U04ABC',
  name: 'alice.m',
  workspaceMemberId: 'member-1',
  consentState: 'ACTIVE',
  ...overrides,
});

const find = (slackUserIds: string[]) =>
  findSlackUserLinksBySlackUserIds(client, {
    slackTeamId: SLACK_TEAM_ID,
    slackUserIds,
  });

describe('findSlackUserLinksBySlackUserIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(buildQueryResult([buildNode()]));
  });

  it('should not query when no Slack user is given', async () => {
    expect(await find([])).toEqual(new Map());
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should query the given Slack users of the installed team in one call', async () => {
    await find(['U04ABC', 'U05DEF']);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].slackUserLinks.__args.filter).toEqual({
      slackTeamId: { eq: SLACK_TEAM_ID },
      slackUserId: { in: ['U04ABC', 'U05DEF'] },
    });
  });

  it('should key the stored links by Slack user id', async () => {
    expect(await find(['U04ABC'])).toEqual(
      new Map([
        [
          'U04ABC',
          {
            slackUserId: 'U04ABC',
            name: 'alice.m',
            workspaceMemberId: 'member-1',
            consentState: 'ACTIVE',
          },
        ],
      ]),
    );
  });

  it('should read empty name and member as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([
        buildNode({ name: '', workspaceMemberId: null, consentState: null }),
      ]),
    );

    expect((await find(['U04ABC'])).get('U04ABC')).toEqual({
      slackUserId: 'U04ABC',
      name: undefined,
      workspaceMemberId: undefined,
      consentState: undefined,
    });
  });

  it('should refuse a consent state it cannot interpret rather than reading it as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([buildNode({ consentState: 'REVOKED' })]),
    );

    await expect(find(['U04ABC'])).rejects.toThrow(
      'Slack user link link-1 has an unsupported consentState "REVOKED"',
    );
  });
});
