import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkableSlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import {
  type SlackRosterMatchCandidate,
  type SlackRosterMatchPlan,
} from 'src/logic-functions/types/slack-roster-match.type';
import { getSlackRosterMemberDisplayName } from 'src/logic-functions/utils/get-slack-roster-member-display-name';
import { getVouchedSlackRosterEmail } from 'src/logic-functions/utils/get-vouched-slack-roster-email';

type PlannedSlackRosterMember =
  | { status: 'alreadyLinked' }
  | { status: 'unmatched' }
  | { status: 'candidate'; candidate: SlackRosterMatchCandidate };

const planRosterMember = ({
  member,
  workspaceMemberIdByEmail,
  linkedSlackUserIds,
  installedSlackTeamId,
}: {
  member: LinkableSlackRosterMember;
  workspaceMemberIdByEmail: Map<string, string>;
  linkedSlackUserIds: Set<string>;
  installedSlackTeamId: string;
}): PlannedSlackRosterMember => {
  const slackUserId = member.id;

  if (linkedSlackUserIds.has(slackUserId)) {
    return { status: 'alreadyLinked' };
  }

  const email = getVouchedSlackRosterEmail({ member, installedSlackTeamId });
  const workspaceMemberId = isNonEmptyString(email)
    ? workspaceMemberIdByEmail.get(email.toLowerCase())
    : undefined;

  if (!isDefined(workspaceMemberId)) {
    return { status: 'unmatched' };
  }

  return {
    status: 'candidate',
    candidate: {
      slackUserId,
      workspaceMemberId,
      displayName: getSlackRosterMemberDisplayName(member),
    },
  };
};

export const planSlackRosterMatch = ({
  members,
  workspaceMemberIdByEmail,
  linkedSlackUserIds,
  installedSlackTeamId,
}: {
  members: LinkableSlackRosterMember[];
  workspaceMemberIdByEmail: Map<string, string>;
  linkedSlackUserIds: Set<string>;
  installedSlackTeamId: string;
}): SlackRosterMatchPlan => {
  const plannedMembers = members.map((member) =>
    planRosterMember({
      member,
      workspaceMemberIdByEmail,
      linkedSlackUserIds,
      installedSlackTeamId,
    }),
  );

  return {
    candidates: plannedMembers.flatMap((plannedMember) =>
      plannedMember.status === 'candidate' ? [plannedMember.candidate] : [],
    ),
    alreadyLinkedCount: plannedMembers.filter(
      (plannedMember) => plannedMember.status === 'alreadyLinked',
    ).length,
    unmatchedCount: plannedMembers.filter(
      (plannedMember) => plannedMember.status === 'unmatched',
    ).length,
  };
};
