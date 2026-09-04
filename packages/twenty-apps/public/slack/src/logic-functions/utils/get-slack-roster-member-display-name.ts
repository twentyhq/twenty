import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';

export const getSlackRosterMemberDisplayName = (
  member: SlackRosterMember,
): string | undefined =>
  [member.profile?.display_name, member.real_name].find(isNonEmptyString);
