import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findDeletedSlackUserLinkId = async (
  client: CoreApiClient,
  { slackTeamId, slackUserId }: { slackTeamId: string; slackUserId: string },
): Promise<string | undefined> => {
  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: {
          slackTeamId: { eq: slackTeamId },
          slackUserId: { eq: slackUserId },
          deletedAt: { is: 'NOT_NULL' },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const id = queryResult.slackUserLinks?.edges?.[0]?.node?.id;

  return isNonEmptyString(id) ? id : undefined;
};
