import { type WebClient } from '@slack/web-api';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { listWorkspaceMemberEmails } from 'src/logic-functions/data/list-workspace-member-emails';
import {
  type SlackRosterMatchCandidate,
  type SlackRosterMatchSummary,
} from 'src/logic-functions/types/slack-roster-match.type';
import { collectSlackRosterMembers } from 'src/logic-functions/utils/collect-slack-roster-members';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';
import { planSlackRosterMatch } from 'src/logic-functions/utils/plan-slack-roster-match';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const linkRosterCandidate = async (
  client: CoreApiClient,
  {
    candidate,
    slackTeamId,
  }: { candidate: SlackRosterMatchCandidate; slackTeamId: string },
): Promise<boolean> => {
  try {
    await persistSlackUserLink(client, {
      existingLink: undefined,
      isSameMemberRelink: false,
      slackTeamId,
      slackUserId: candidate.slackUserId,
      workspaceMemberId: candidate.workspaceMemberId,
      name: candidate.displayName,
      source: SLACK_USER_LINK_SOURCE.AUTO,
      consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
    });

    return true;
  } catch (error) {
    console.warn(
      `[slack] roster match could not link ${candidate.slackUserId}: ${toErrorMessage(error)}`,
    );

    return false;
  }
};

export const matchSlackRosterByEmail = async ({
  slackClient,
  slackTeamId,
}: {
  slackClient: WebClient;
  slackTeamId: string;
}): Promise<SlackRosterMatchSummary> => {
  const client = new CoreApiClient({ runAs: 'application' });

  const [workspaceMemberIdByEmail, linkedSlackUserIds, roster] =
    await Promise.all([
      listWorkspaceMemberEmails(client),
      listLinkedSlackUserIds(client, { slackTeamId }),
      collectSlackRosterMembers({ slackClient }),
    ]);

  const { candidates, alreadyLinkedCount, unmatchedCount } =
    planSlackRosterMatch({
      members: roster.members,
      workspaceMemberIdByEmail,
      linkedSlackUserIds,
      installedSlackTeamId: slackTeamId,
    });

  const linkOutcomes: boolean[] = [];

  for (const candidate of candidates) {
    linkOutcomes.push(
      await linkRosterCandidate(client, { candidate, slackTeamId }),
    );
  }

  return {
    linkedCount: linkOutcomes.filter((isLinked) => isLinked).length,
    alreadyLinkedCount,
    unmatchedCount,
    failedCount: linkOutcomes.filter((isLinked) => !isLinked).length,
    isRosterTruncated: roster.isTruncated,
  };
};
