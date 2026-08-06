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
  const mentionRunPattern = `(?:\\s*${mentionPattern})+\\s*`;

  return text
    .replace(new RegExp(`^${mentionRunPattern}${PUNCTUATION_PATTERN}*\\s*`), '')
    .replace(
      new RegExp(`${mentionRunPattern}(${PUNCTUATION_PATTERN})`, 'g'),
      '$1',
    )
    .replace(new RegExp(mentionPattern, 'g'), ' ');
};
