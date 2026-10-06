import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

const MENTION_TAG_PATTERN = /<at>(.*?)<\/at>/g;

const collectBotMentionTexts = (activity: TeamsInboundActivity): string[] =>
  (activity.entities ?? [])
    .filter(
      (entity) =>
        entity.type === 'mention' &&
        isNonEmptyString(activity.recipient?.id) &&
        entity.mentioned?.id === activity.recipient.id,
    )
    .map((entity) => entity.text)
    .filter(isNonEmptyString);

export const normalizeTeamsRequestText = (
  activity: TeamsInboundActivity,
): string =>
  collectBotMentionTexts(activity)
    .reduce(
      (text, botMentionText) => text.split(botMentionText).join(' '),
      activity.text ?? '',
    )
    .replace(MENTION_TAG_PATTERN, '$1')
    .replace(/\s+/g, ' ')
    .trim();
