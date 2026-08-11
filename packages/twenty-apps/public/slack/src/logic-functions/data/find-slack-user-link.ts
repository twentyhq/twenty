import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findSlackUserLinkWorkspaceMemberId = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserId,
  }: { slackTeamId: string; slackUserId: string },
): Promise<string | undefined> => {
  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: {
          slackTeamId: { eq: slackTeamId },
          slackUserId: { eq: slackUserId },
        },
        first: 1,
      },
      edges: { node: { workspaceMemberId: true } },
    },
  });

  const workspaceMemberId =
    queryResult.slackUserLinks?.edges?.[0]?.node?.workspaceMemberId;

  return workspaceMemberId ?? undefined;
};
