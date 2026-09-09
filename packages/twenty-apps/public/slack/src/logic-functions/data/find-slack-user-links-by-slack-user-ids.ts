import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export type SlackUserLinkSummary = {
  slackUserId: string;
  name: string | undefined;
  workspaceMemberId: string | undefined;
};

const LINKS_PER_PAGE = 200;

export const findSlackUserLinksBySlackUserIds = async (
  client: CoreApiClient,
  { slackTeamId, slackUserIds }: { slackTeamId: string; slackUserIds: string[] },
): Promise<Map<string, SlackUserLinkSummary>> => {
  const linkBySlackUserId = new Map<string, SlackUserLinkSummary>();

  if (slackUserIds.length === 0) {
    return linkBySlackUserId;
  }

  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: {
          slackTeamId: { eq: slackTeamId },
          slackUserId: { in: slackUserIds },
        },
        first: LINKS_PER_PAGE,
      },
      edges: {
        node: { slackUserId: true, name: true, workspaceMemberId: true },
      },
    },
  });

  for (const edge of queryResult.slackUserLinks?.edges ?? []) {
    const node = edge?.node;

    if (!isNonEmptyString(node?.slackUserId)) {
      continue;
    }

    linkBySlackUserId.set(node.slackUserId, {
      slackUserId: node.slackUserId,
      name: isNonEmptyString(node.name) ? node.name : undefined,
      workspaceMemberId: isNonEmptyString(node.workspaceMemberId)
        ? node.workspaceMemberId
        : undefined,
    });
  }

  return linkBySlackUserId;
};
