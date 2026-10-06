import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

const MENTION_TAG_PATTERN = /<at>(.*?)<\/at>/g;

export const normalizeTeamsRequestText = ({
  text,
  entities,
  recipient,
}: TeamsInboundActivity): string => {
  const botMentionTexts = (entities ?? [])
    .filter(
      (entity) =>
        entity.type === 'mention' &&
        isNonEmptyString(recipient?.id) &&
        entity.mentioned?.id === recipient.id,
    )
    .map((entity) => entity.text)
    .filter(isNonEmptyString);

  return botMentionTexts
    .reduce(
      (remainingText, botMentionText) =>
        remainingText.split(botMentionText).join(' '),
      text ?? '',
    )
    .replace(MENTION_TAG_PATTERN, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};
