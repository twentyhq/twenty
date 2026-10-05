import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';

const SLACK_USER_ID_PATTERN = /^[A-Z0-9]+$/;
const PUNCTUATION_PATTERN = '[,.!?;:]';

export const stripSlackBotMention = ({
  text,
  botUserId,
}: {
  text: string;
  botUserId: string;
}): string => {
  if (!SLACK_USER_ID_PATTERN.test(botUserId)) {
    return text;
  }

  const mentionPattern = `<@${botUserId}(?:\\|[^>]*)?>`;
  const mentionRunPattern = `${mentionPattern}(?:\\s*${mentionPattern})*`;

  return text
    .replace(
      new RegExp(`^\\s*${mentionRunPattern}\\s*${PUNCTUATION_PATTERN}*\\s*`),
      '',
    )
    .replace(
      new RegExp(`\\s*${mentionRunPattern}\\s*(${PUNCTUATION_PATTERN})`, 'g'),
      ` ${SLACK_ASSISTANT_MENTION_LABEL}$1`,
    )
    .replace(
      new RegExp(`\\s*${mentionRunPattern}\\s*`, 'g'),
      ` ${SLACK_ASSISTANT_MENTION_LABEL} `,
    );
};
