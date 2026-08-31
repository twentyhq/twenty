import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { isSlackUserLinkConsentState } from 'src/logic-functions/utils/is-slack-user-link-consent-state';
import { isSlackUserLinkSource } from 'src/logic-functions/utils/is-slack-user-link-source';

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
        node: {
          id: true,
          workspaceMemberId: true,
          source: true,
          consentState: true,
        },
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
    source: isSlackUserLinkSource(node.source) ? node.source : undefined,
    consentState: isSlackUserLinkConsentState(node.consentState)
      ? node.consentState
      : undefined,
  };
};
