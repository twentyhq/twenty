import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';
import { collectTeamsBotMentionTexts } from 'src/features/chat/logic-functions/utils/collect-teams-bot-mention-texts';

const MENTION_TAG_PATTERN = /<at>(.*?)<\/at>/g;

export const normalizeTeamsRequestText = (
  activity: TeamsInboundActivity,
): string =>
  collectTeamsBotMentionTexts(activity)
    .reduce(
      (remainingText, botMentionText) =>
        remainingText.split(botMentionText).join(' '),
      activity.text ?? '',
    )
    .replace(MENTION_TAG_PATTERN, '$1')
    .replace(/\s+/g, ' ')
    .trim();
