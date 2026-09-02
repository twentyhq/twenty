import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { findWorkspaceMemberIdsByEmails } from 'src/logic-functions/data/find-workspace-member-ids-by-emails';
import { type SlackRosterMatchSummary } from 'src/logic-functions/types/slack-roster-match.type';
import { collectSlackRosterMembers } from 'src/logic-functions/utils/collect-slack-roster-members';
import { getVouchedSlackRosterEmail } from 'src/logic-functions/utils/get-vouched-slack-roster-email';
import { linkSlackRosterCandidates } from 'src/logic-functions/utils/link-slack-roster-candidates';
import { planSlackRosterMatch } from 'src/logic-functions/utils/plan-slack-roster-match';

export const matchSlackRosterByEmail = async ({
  slackClient,
  slackTeamId,
}: {
  slackClient: WebClient;
  slackTeamId: string;
}): Promise<SlackRosterMatchSummary> => {
  const client = new CoreApiClient({ runAs: 'application' });

  const [linkedSlackUserIds, roster] = await Promise.all([
    listLinkedSlackUserIds(client, { slackTeamId }),
    collectSlackRosterMembers({ slackClient }),
  ]);

  const vouchedRosterEmails = roster.members
    .map((member) =>
      getVouchedSlackRosterEmail({
        member,
        installedSlackTeamId: slackTeamId,
      }),
    )
    .filter(isNonEmptyString);

  const { workspaceMemberIdByEmail, ambiguousEmailCount } =
    await findWorkspaceMemberIdsByEmails(client, {
      emails: vouchedRosterEmails,
    });

  const { candidates, alreadyLinkedCount, unmatchedCount } =
    planSlackRosterMatch({
      members: roster.members,
      workspaceMemberIdByEmail,
      linkedSlackUserIds,
      installedSlackTeamId: slackTeamId,
    });

  const { linkedCount, failedCount } = await linkSlackRosterCandidates(client, {
    candidates,
    slackTeamId,
  });

  return {
    linkedCount,
    alreadyLinkedCount,
    unmatchedCount,
    ambiguousEmailCount,
    failedCount,
    isRosterTruncated: roster.isTruncated,
  };
};
