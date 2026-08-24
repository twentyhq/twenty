import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';

export const createSlackUserLink = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name,
    source = SLACK_USER_LINK_SOURCE.AUTO,
  }: {
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    name: string;
    source?: string;
  },
): Promise<void> => {
  await client.mutation({
    createSlackUserLink: {
      __args: {
        data: {
          slackTeamId,
          slackUserId,
          workspaceMemberId,
          name,
          source,
        },
      },
      id: true,
    },
  });
};
