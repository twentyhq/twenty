import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';

const SLACK_TEAM_ID = 'T-installed';

const buildClient = (
  pages: { slackUserIds: string[]; endCursor?: string }[],
) => {
  const queryMock = vi.fn();

  for (const page of pages) {
    queryMock.mockResolvedValueOnce({
      slackUserLinks: {
        edges: page.slackUserIds.map((slackUserId) => ({
          node: { slackUserId },
        })),
        pageInfo: {
          hasNextPage: page.endCursor !== undefined,
          endCursor: page.endCursor ?? null,
        },
      },
    });
  }

  return {
    client: { query: queryMock } as unknown as CoreApiClient,
    queryMock,
  };
};

const filterOfCall = (queryMock: ReturnType<typeof vi.fn>, call: number) =>
  queryMock.mock.calls[call][0].slackUserLinks.__args.filter;

describe('listLinkedSlackUserIds', () => {
  it('should ask for every link of the team when no Slack user is given', async () => {
    const { client, queryMock } = buildClient([{ slackUserIds: ['U1', 'U2'] }]);

    const linkedSlackUserIds = await listLinkedSlackUserIds(client, {
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(filterOfCall(queryMock, 0)).toEqual({
      slackTeamId: { eq: SLACK_TEAM_ID },
    });
    expect([...linkedSlackUserIds]).toEqual(['U1', 'U2']);
  });

  it('should narrow the query to the given Slack users', async () => {
    const { client, queryMock } = buildClient([{ slackUserIds: ['U1'] }]);

    const linkedSlackUserIds = await listLinkedSlackUserIds(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1', 'U2'],
    });

    expect(filterOfCall(queryMock, 0)).toEqual({
      slackTeamId: { eq: SLACK_TEAM_ID },
      slackUserId: { in: ['U1', 'U2'] },
    });
    expect([...linkedSlackUserIds]).toEqual(['U1']);
  });

  it('should follow pagination', async () => {
    const { client, queryMock } = buildClient([
      { slackUserIds: ['U1'], endCursor: 'cursor-2' },
      { slackUserIds: ['U2'] },
    ]);

    const linkedSlackUserIds = await listLinkedSlackUserIds(client, {
      slackTeamId: SLACK_TEAM_ID,
    });

    expect([...linkedSlackUserIds]).toEqual(['U1', 'U2']);
    expect(queryMock.mock.calls[1][0].slackUserLinks.__args.after).toBe(
      'cursor-2',
    );
  });
});
