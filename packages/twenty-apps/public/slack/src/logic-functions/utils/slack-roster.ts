import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

const SLACKBOT_USER_ID = 'USLACKBOT';
const PAGE_SIZE = 200;
const MAX_PAGES = 5;

export type SlackRosterMember = {
  id?: string;
  team_id?: string;
  is_bot?: boolean;
  deleted?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_stranger?: boolean;
  is_email_confirmed?: boolean;
  real_name?: string;
  profile?: { display_name?: string; email?: string };
};

export const isLinkableRosterMember = (member: SlackRosterMember): boolean =>
  isNonEmptyString(member.id) &&
  member.id !== SLACKBOT_USER_ID &&
  member.is_bot !== true &&
  member.deleted !== true;

export const isRosterEmailVouchedForOwner = ({
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

export const getRosterMemberDisplayName = (
  member: SlackRosterMember,
): string | undefined =>
  [member.profile?.display_name, member.real_name].find(isNonEmptyString);

export const walkSlackRoster = async (
  slackClient: WebClient,
  visit: (member: SlackRosterMember) => 'stop' | undefined,
): Promise<{ isTruncated: boolean }> => {
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await slackClient.users.list({
      limit: PAGE_SIZE,
      cursor,
    });

    for (const member of response.members ?? []) {
      if (!isLinkableRosterMember(member)) {
        continue;
      }

      if (visit(member) === 'stop') {
        return { isTruncated: true };
      }
    }

    cursor = response.response_metadata?.next_cursor;

    if (!isNonEmptyString(cursor)) {
      return { isTruncated: false };
    }
  }

  return { isTruncated: true };
};
