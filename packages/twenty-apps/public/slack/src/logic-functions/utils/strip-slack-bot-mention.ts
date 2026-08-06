const SLACK_USER_ID_PATTERN = /^[A-Z0-9]+$/;

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

  return text
    .replace(new RegExp(`(?:\\s*${mentionPattern})+\\s*([,.!?;:])`, 'g'), '$1')
    .replace(new RegExp(mentionPattern, 'g'), ' ');
};
