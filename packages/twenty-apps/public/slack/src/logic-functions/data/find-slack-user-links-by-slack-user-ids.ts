import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { isSlackUserLinkConsentState } from 'src/logic-functions/utils/is-slack-user-link-consent-state';
import { isSlackUserLinkSource } from 'src/logic-functions/utils/is-slack-user-link-source';

const LINKS_PER_PAGE = 200;

// A link is keyed by the Slack workspace its user belongs to, which for a guest
// or Slack Connect member is not the workspace the app is installed in.
export const findSlackUserLinksBySlackUserIds = async (
  client: CoreApiClient,
  {
    slackUserIdsBySlackTeamId,
  }: { slackUserIdsBySlackTeamId: ReadonlyMap<string, string[]> },
): Promise<Map<string, SlackUserLinkSummary>> => {
  const linkBySlackUserId = new Map<string, SlackUserLinkSummary>();

  const teamFilters = [...slackUserIdsBySlackTeamId.entries()]
    .filter(([slackTeamId, slackUserIds]) =>
      isNonEmptyString(slackTeamId) && slackUserIds.length > 0,
    )
    .map(([slackTeamId, slackUserIds]) => ({
      and: [
        { slackTeamId: { eq: slackTeamId } },
        { slackUserId: { in: slackUserIds } },
      ],
    }));

  if (teamFilters.length === 0) {
    return linkBySlackUserId;
  }

  const queryResult = await client.query({
    slackUserLinks: {
      __args: {
        filter: { or: teamFilters },
        first: LINKS_PER_PAGE,
      },
      edges: {
        node: {
          id: true,
          slackUserId: true,
          slackTeamId: true,
          name: true,
          workspaceMemberId: true,
          source: true,
          consentState: true,
        },
      },
    },
  });

  for (const edge of queryResult.slackUserLinks?.edges ?? []) {
    const node = edge?.node;

    if (
      !isNonEmptyString(node?.slackUserId) ||
      !isNonEmptyString(node.slackTeamId)
    ) {
      continue;
    }

    // A value this version cannot interpret must never collapse into a trusted
    // one, the way find-slack-user-link guards the single-link read.
    if (isNonEmptyString(node.source) && !isSlackUserLinkSource(node.source)) {
      throw new Error(
        `Slack user link ${node.id} has an unsupported source "${node.source}"`,
      );
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
      slackTeamId: node.slackTeamId,
      name: isNonEmptyString(node.name) ? node.name : undefined,
      workspaceMemberId: isNonEmptyString(node.workspaceMemberId)
        ? node.workspaceMemberId
        : undefined,
      source: isSlackUserLinkSource(node.source) ? node.source : undefined,
      consentState: isSlackUserLinkConsentState(node.consentState)
        ? node.consentState
        : undefined,
    });
  }

  return linkBySlackUserId;
};
