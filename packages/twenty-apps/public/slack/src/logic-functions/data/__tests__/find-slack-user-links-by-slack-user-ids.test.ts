import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackUserLinksBySlackUserIds } from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';

const SLACK_TEAM_ID = 'T0INSTALLED';
const EXTERNAL_SLACK_TEAM_ID = 'T0EXTERNAL';

const queryMock = vi.fn();

const client = { query: queryMock } as unknown as CoreApiClient;

const buildQueryResult = (nodes: Record<string, unknown>[]) => ({
  slackUserLinks: { edges: nodes.map((node) => ({ node })) },
});

const buildNode = (overrides: Record<string, unknown> = {}) => ({
  id: 'link-1',
  slackUserId: 'U04ABC',
  slackTeamId: SLACK_TEAM_ID,
  name: 'alice.m',
  workspaceMemberId: 'member-1',
  source: 'MANUAL',
  consentState: 'ACTIVE',
  ...overrides,
});

const find = (slackUserIdsBySlackTeamId: Record<string, string[]>) =>
  findSlackUserLinksBySlackUserIds(client, {
    slackUserIdsBySlackTeamId: new Map(
      Object.entries(slackUserIdsBySlackTeamId),
    ),
  });

describe('findSlackUserLinksBySlackUserIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(buildQueryResult([buildNode()]));
  });

  it('should not query when no Slack user is given', async () => {
    expect(await find({})).toEqual(new Map());
    expect(await find({ [SLACK_TEAM_ID]: [] })).toEqual(new Map());
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should query the given Slack users of one team in one call', async () => {
    await find({ [SLACK_TEAM_ID]: ['U04ABC', 'U05DEF'] });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].slackUserLinks.__args.filter).toEqual({
      or: [
        {
          and: [
            { slackTeamId: { eq: SLACK_TEAM_ID } },
            { slackUserId: { in: ['U04ABC', 'U05DEF'] } },
          ],
        },
      ],
    });
  });

  // A Slack Connect or Enterprise Grid member's link is stored under their own
  // team, so querying only the installed team would never find it.
  it('should query every team a mentioned user belongs to in one call', async () => {
    await find({
      [SLACK_TEAM_ID]: ['U04ABC'],
      [EXTERNAL_SLACK_TEAM_ID]: ['U0GUEST'],
    });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].slackUserLinks.__args.filter).toEqual({
      or: [
        {
          and: [
            { slackTeamId: { eq: SLACK_TEAM_ID } },
            { slackUserId: { in: ['U04ABC'] } },
          ],
        },
        {
          and: [
            { slackTeamId: { eq: EXTERNAL_SLACK_TEAM_ID } },
            { slackUserId: { in: ['U0GUEST'] } },
          ],
        },
      ],
    });
  });

  it('should return the link of a user linked under an external team', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([
        buildNode({
          slackUserId: 'U0GUEST',
          slackTeamId: EXTERNAL_SLACK_TEAM_ID,
        }),
      ]),
    );

    expect(
      (await find({ [EXTERNAL_SLACK_TEAM_ID]: ['U0GUEST'] })).get('U0GUEST'),
    ).toEqual(
      expect.objectContaining({
        slackUserId: 'U0GUEST',
        slackTeamId: EXTERNAL_SLACK_TEAM_ID,
        workspaceMemberId: 'member-1',
      }),
    );
  });

  it('should key the stored links by Slack user id', async () => {
    expect(await find({ [SLACK_TEAM_ID]: ['U04ABC'] })).toEqual(
      new Map([
        [
          'U04ABC',
          {
            slackUserId: 'U04ABC',
            slackTeamId: SLACK_TEAM_ID,
            name: 'alice.m',
            workspaceMemberId: 'member-1',
            source: 'MANUAL',
            consentState: 'ACTIVE',
          },
        ],
      ]),
    );
  });

  it('should read empty name and member as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([
        buildNode({
          name: '',
          workspaceMemberId: null,
          source: null,
          consentState: null,
        }),
      ]),
    );

    expect((await find({ [SLACK_TEAM_ID]: ['U04ABC'] })).get('U04ABC')).toEqual(
      {
        slackUserId: 'U04ABC',
        slackTeamId: SLACK_TEAM_ID,
        name: undefined,
        workspaceMemberId: undefined,
        source: undefined,
        consentState: undefined,
      },
    );
  });

  it('should refuse a consent state it cannot interpret rather than reading it as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([buildNode({ consentState: 'REVOKED' })]),
    );

    await expect(find({ [SLACK_TEAM_ID]: ['U04ABC'] })).rejects.toThrow(
      'Slack user link link-1 has an unsupported consentState "REVOKED"',
    );
  });

  it('should refuse a source it cannot interpret rather than reading it as absent', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([buildNode({ source: 'IMPORTED' })]),
    );

    await expect(find({ [SLACK_TEAM_ID]: ['U04ABC'] })).rejects.toThrow(
      'Slack user link link-1 has an unsupported source "IMPORTED"',
    );
  });
});
