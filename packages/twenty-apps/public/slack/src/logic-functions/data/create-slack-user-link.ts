import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const createSlackUserLink = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name,
    source = SLACK_USER_LINK_SOURCE.AUTO,
    consentState = SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
  }: {
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    name: string;
    source?: SlackUserLinkSource;
    consentState?: SlackUserLinkConsentState;
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

  return result.createSlackUserLink.id;
};
