import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_MAPPING_SOURCE } from 'src/logic-functions/constants/slack-user-mapping-source';

export const createSlackUserMapping = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name,
  }: {
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    name: string;
  },
): Promise<void> => {
  await client.mutation({
    createSlackUserMapping: {
      __args: {
        data: {
          slackTeamId,
          slackUserId,
          workspaceMemberId,
          name,
          source: SLACK_USER_MAPPING_SOURCE.AUTO,
        },
      },
      id: true,
    },
  });
};
