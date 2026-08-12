import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export type SlackUserLink = {
  id: string;
  workspaceMemberId: string | undefined;
  source: string | undefined;
};

export const findSlackUserLink = async (
  client: CoreApiClient,
  { slackTeamId, slackUserId }: { slackTeamId: string; slackUserId: string },
): Promise<SlackUserLink | undefined> => {
  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: {
          slackTeamId: { eq: slackTeamId },
          slackUserId: { eq: slackUserId },
        },
        first: 1,
      },
      edges: {
        node: { id: true, workspaceMemberId: true, source: true },
      },
    },
  });

  const node = queryResult.slackUserLinks?.edges?.[0]?.node;

  if (!isNonEmptyString(node?.id)) {
    return undefined;
  }

  return {
    id: node.id,
    workspaceMemberId: node.workspaceMemberId ?? undefined,
    source: node.source ?? undefined,
  };
};
