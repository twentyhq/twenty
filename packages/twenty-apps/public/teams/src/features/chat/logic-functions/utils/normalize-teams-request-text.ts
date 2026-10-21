import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';
import { collectTeamsBotMentionTexts } from 'src/features/chat/logic-functions/utils/collect-teams-bot-mention-texts';

const MENTION_TAG_PATTERN = /<at>(.*?)<\/at>/g;

const joinAroundRemovedMention = (left: string, right: string): string => {
  const trimmedLeft = left.replace(/[ \t]+$/, '');
  const trimmedRight = right.replace(/^[ \t]+/, '');
  const separator =
    /\S$/.test(trimmedLeft) && /^\S/.test(trimmedRight) ? ' ' : '';

  return `${trimmedLeft}${separator}${trimmedRight}`;
};

export const normalizeTeamsRequestText = (
  activity: TeamsInboundActivity,
): string =>
  collectTeamsBotMentionTexts(activity)
    .reduce(
      (remainingText, botMentionText) =>
        remainingText.split(botMentionText).reduce(joinAroundRemovedMention),
      activity.text ?? '',
    )
    .replace(MENTION_TAG_PATTERN, '$1')
    .trim();
