import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { listWorkspaceMemberEmails } from 'src/logic-functions/data/list-workspace-member-emails';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';
import {
  getRosterMemberDisplayName,
  isRosterEmailVouchedForOwner,
  walkSlackRoster,
} from 'src/logic-functions/utils/slack-roster';

export type SlackRosterMatchSummary = {
  linkedCount: number;
  alreadyLinkedCount: number;
  unmatchedCount: number;
};

export const matchSlackRosterByEmail = async ({
  slackClient,
  slackTeamId,
}: {
  slackClient: WebClient;
  slackTeamId: string;
}): Promise<SlackRosterMatchSummary> => {
  const client = new CoreApiClient({ runAs: 'application' });

  const [memberIdByEmail, linkedSlackUserIds] = await Promise.all([
    listWorkspaceMemberEmails(client),
    listLinkedSlackUserIds(client, { slackTeamId }),
  ]);

  const candidates: {
    slackUserId: string;
    workspaceMemberId: string;
    displayName: string | undefined;
  }[] = [];
  let alreadyLinkedCount = 0;
  let unmatchedCount = 0;

  await walkSlackRoster(slackClient, (member) => {
    const slackUserId = member.id;

    if (!isNonEmptyString(slackUserId)) {
      return undefined;
    }

    if (linkedSlackUserIds.has(slackUserId)) {
      alreadyLinkedCount += 1;

      return undefined;
    }

    const email = isRosterEmailVouchedForOwner(member)
      ? member.profile?.email
      : undefined;
    const workspaceMemberId = isNonEmptyString(email)
      ? memberIdByEmail.get(email.toLowerCase())
      : undefined;

    if (!isDefined(workspaceMemberId)) {
      unmatchedCount += 1;

      return undefined;
    }

    candidates.push({
      slackUserId,
      workspaceMemberId,
      displayName: getRosterMemberDisplayName(member),
    });

    return undefined;
  });

  for (const candidate of candidates) {
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
  }

  return {
    linkedCount: candidates.length,
    alreadyLinkedCount,
    unmatchedCount,
  };
};
