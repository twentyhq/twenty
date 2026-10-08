import { SLACK_USER_MENTION_PATTERN } from 'src/logic-functions/constants/slack-user-mention-pattern';

export const collectSlackMentionedUserIds = (
  texts: readonly string[],
): string[] => [
  ...new Set(
    texts.flatMap((text) =>
      [...text.matchAll(SLACK_USER_MENTION_PATTERN)].map((match) => match[1]),
    ),
  ),
];
