import { type LinkableSlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { type SlackUserSearchOption } from 'src/logic-functions/types/slack-user-search.type';
import { getSlackRosterMemberDisplayName } from 'src/logic-functions/utils/get-slack-roster-member-display-name';
import { getVouchedSlackRosterEmail } from 'src/logic-functions/utils/get-vouched-slack-roster-email';

export const toSlackUserSearchOption = ({
  member,
  installedSlackTeamId,
}: {
  member: LinkableSlackRosterMember;
  installedSlackTeamId: string;
}): SlackUserSearchOption => ({
  slackUserId: member.id,
  slackTeamId: installedSlackTeamId,
  displayName: getSlackRosterMemberDisplayName(member),
  email: getVouchedSlackRosterEmail({ member, installedSlackTeamId }),
});
