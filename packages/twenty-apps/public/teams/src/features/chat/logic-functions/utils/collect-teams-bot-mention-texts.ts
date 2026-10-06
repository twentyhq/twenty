import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

export const collectTeamsBotMentionTexts = ({
  entities,
  recipient,
}: TeamsInboundActivity): string[] =>
  (entities ?? [])
    .filter(
      (entity) =>
        entity.type === 'mention' &&
        isNonEmptyString(recipient?.id) &&
        entity.mentioned?.id === recipient.id,
    )
    .map((entity) => entity.text)
    .filter(isNonEmptyString);
