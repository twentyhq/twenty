import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { isSlackUserLinkConsentState } from 'src/logic-functions/utils/is-slack-user-link-consent-state';

const LINKS_PER_PAGE = 200;

export const findSlackUserLinksBySlackUserIds = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserIds,
  }: { slackTeamId: string; slackUserIds: string[] },
): Promise<Map<string, SlackUserLinkSummary>> => {
  const linkBySlackUserId = new Map<string, SlackUserLinkSummary>();

  if (slackUserIds.length === 0) {
    return linkBySlackUserId;
  }

  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: {
          slackTeamId: { eq: slackTeamId },
          slackUserId: { in: slackUserIds },
        },
        first: LINKS_PER_PAGE,
      },
      edges: {
        node: {
          id: true,
          slackUserId: true,
          name: true,
          workspaceMemberId: true,
          consentState: true,
        },
      },
    },
  });

  for (const edge of queryResult.slackUserLinks?.edges ?? []) {
    const node = edge?.node;

    if (!isNonEmptyString(node?.slackUserId)) {
      continue;
    }

    if (
      isNonEmptyString(node.consentState) &&
      !isSlackUserLinkConsentState(node.consentState)
    ) {
      throw new Error(
        `Slack user link ${node.id} has an unsupported consentState "${node.consentState}"`,
      );
    }

    linkBySlackUserId.set(node.slackUserId, {
      slackUserId: node.slackUserId,
      name: isNonEmptyString(node.name) ? node.name : undefined,
      workspaceMemberId: isNonEmptyString(node.workspaceMemberId)
        ? node.workspaceMemberId
        : undefined,
      consentState: isSlackUserLinkConsentState(node.consentState)
        ? node.consentState
        : undefined,
    });
  }

  return linkBySlackUserId;
};
