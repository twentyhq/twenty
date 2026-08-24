import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

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
    source?: SlackUserLinkSource;
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
