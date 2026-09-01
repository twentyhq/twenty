import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const createSlackUserLink = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name,
    source,
    consentState,
  }: {
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    name: string;
    source: SlackUserLinkSource;
    consentState: SlackUserLinkConsentState;
  },
): Promise<string> => {
  const result = await client.mutation({
    createSlackUserLink: {
      __args: {
        data: {
          slackTeamId,
          slackUserId,
          workspaceMemberId,
          name,
          source,
          consentState,
        },
      },
      id: true,
    },
  });

  const createdId = result.createSlackUserLink?.id;

  if (!isNonEmptyString(createdId)) {
    throw new Error('Slack user link creation returned no id');
  }

  return createdId;
};
