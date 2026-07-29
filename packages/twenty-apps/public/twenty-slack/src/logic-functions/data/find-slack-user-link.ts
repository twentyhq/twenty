import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findSlackUserLink = async (
  client: CoreApiClient,
  { slackUserId }: { slackUserId: string },
): Promise<{ workspaceMemberId: string } | undefined> => {
  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: { slackUserId: { eq: slackUserId } },
        first: 1,
      },
      edges: { node: { workspaceMemberId: true } },
    },
  });

  const workspaceMemberId =
    queryResult.slackUserLinks?.edges?.[0]?.node?.workspaceMemberId;

  return isNonEmptyString(workspaceMemberId)
    ? { workspaceMemberId }
    : undefined;
};
