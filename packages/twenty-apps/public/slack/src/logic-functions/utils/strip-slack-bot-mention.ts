const SLACK_USER_ID_PATTERN = /^[A-Z0-9]+$/;
const PUNCTUATION_PATTERN = '[,.!?;:]';
const MID_TEXT_MENTION_REPLACEMENT = 'you';

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
      new RegExp(`${mentionRunPattern}\\s*(${PUNCTUATION_PATTERN})`, 'g'),
      ` ${MID_TEXT_MENTION_REPLACEMENT}$1`,
    )
    .replace(
      new RegExp(mentionRunPattern, 'g'),
      ` ${MID_TEXT_MENTION_REPLACEMENT} `,
    );
};
