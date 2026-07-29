import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';

export const createSlackUserLink = async (
  client: CoreApiClient,
  {
    slackUserId,
    workspaceMemberId,
  }: { slackUserId: string; workspaceMemberId: string },
): Promise<void> => {
  await client.mutation({
    createSlackUserLink: {
      __args: {
        data: {
          slackUserId,
          workspaceMemberId,
          linkSource: SLACK_USER_LINK_SOURCE.EMAIL_MATCH,
        },
      },
      id: true,
    },
  });
};
