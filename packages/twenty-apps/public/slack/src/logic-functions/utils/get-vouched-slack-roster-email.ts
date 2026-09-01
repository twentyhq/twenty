import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';

// A guest or Slack Connect address is vouched for by another workspace's admin,
// so it must never drive an automatic link.
const isEmailVouchedForByInstalledWorkspace = ({
  member,
  installedSlackTeamId,
}: {
  member: SlackRosterMember;
  installedSlackTeamId: string;
}): boolean =>
  member.team_id === installedSlackTeamId &&
  member.is_stranger !== true &&
  member.is_restricted !== true &&
  member.is_ultra_restricted !== true &&
  member.is_email_confirmed === true;

export const getVouchedSlackRosterEmail = ({
  member,
  installedSlackTeamId,
}: {
  member: SlackRosterMember;
  installedSlackTeamId: string;
}): string | undefined =>
  isEmailVouchedForByInstalledWorkspace({ member, installedSlackTeamId }) &&
  isNonEmptyString(member.profile?.email)
    ? member.profile.email
    : undefined;
