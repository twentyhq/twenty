import { isNonEmptyString } from '@sniptt/guards';

import { stripSlackBotMention } from 'src/logic-functions/utils/strip-slack-bot-mention';

export const normalizeSlackRequestText = ({
  text,
  botUserId,
}: {
  text: string;
  botUserId: string | undefined;
}): string => {
  const strippedText = isNonEmptyString(botUserId)
    ? stripSlackBotMention({ text, botUserId })
    : text;

  return strippedText.replace(/\s+/g, ' ').trim();
};
