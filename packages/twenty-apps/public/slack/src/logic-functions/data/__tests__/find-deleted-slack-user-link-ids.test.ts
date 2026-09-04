import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findDeletedSlackUserLinkIds } from 'src/logic-functions/data/find-deleted-slack-user-link-ids';

const SLACK_TEAM_ID = 'T-installed';

const buildClient = (pages: { ids: string[]; endCursor?: string }[]) => {
  const queryMock = vi.fn();

  for (const page of pages) {
    queryMock.mockResolvedValueOnce({
      slackUserLinks: {
        edges: page.ids.map((id) => ({ node: { id } })),
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

describe('findDeletedSlackUserLinkIds', () => {
  it('should ask only for soft-deleted links of the given Slack users', async () => {
    const { client, queryMock } = buildClient([{ ids: [] }]);

    await findDeletedSlackUserLinkIds(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1', 'U2'],
    });

    expect(queryMock.mock.calls[0][0].slackUserLinks.__args.filter).toEqual({
      slackTeamId: { eq: SLACK_TEAM_ID },
      slackUserId: { in: ['U1', 'U2'] },
      deletedAt: { is: 'NOT_NULL' },
    });
  });

  it('should return every matching link id', async () => {
    const { client } = buildClient([{ ids: ['link-1', 'link-2'] }]);

    const deletedLinkIds = await findDeletedSlackUserLinkIds(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1', 'U2'],
    });

    expect(deletedLinkIds).toEqual(['link-1', 'link-2']);
  });

  it('should follow pagination', async () => {
    const { client, queryMock } = buildClient([
      { ids: ['link-1'], endCursor: 'cursor-2' },
      { ids: ['link-2'] },
    ]);

    const deletedLinkIds = await findDeletedSlackUserLinkIds(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: ['U1'],
    });

    expect(deletedLinkIds).toEqual(['link-1', 'link-2']);
    expect(queryMock.mock.calls[1][0].slackUserLinks.__args.after).toBe(
      'cursor-2',
    );
  });

  it('should not query when there is no Slack user to check', async () => {
    const { client, queryMock } = buildClient([]);

    const deletedLinkIds = await findDeletedSlackUserLinkIds(client, {
      slackTeamId: SLACK_TEAM_ID,
      slackUserIds: [],
    });

    expect(queryMock).not.toHaveBeenCalled();
    expect(deletedLinkIds).toEqual([]);
  });
});
