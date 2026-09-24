import { isNonEmptyString } from '@sniptt/guards';

import {
  type LinkableSlackRosterMember,
  type SlackRosterMember,
} from 'src/logic-functions/types/slack-roster-member.type';

const SLACKBOT_USER_ID = 'USLACKBOT';

export const isLinkableSlackRosterMember = (
  member: SlackRosterMember,
): member is LinkableSlackRosterMember =>
  isNonEmptyString(member.id) &&
  member.id !== SLACKBOT_USER_ID &&
  member.is_bot !== true &&
  member.deleted !== true;
