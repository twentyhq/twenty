import { isNonEmptyString } from '@sniptt/guards';

const SLACK_USER_MENTION_PATTERN = /<@([A-Z0-9]+)(?:\|[^>]*)?>/g;
const SLACK_CHANNEL_MENTION_PATTERN = /<#([A-Z0-9]+)(?:\|([^>]*))?>/g;
const SLACK_USER_GROUP_MENTION_PATTERN =
  /<!subteam\^([A-Z0-9]+)(?:\|([^>]*))?>/g;
const SLACK_BROADCAST_MENTION_PATTERN = /<!(here|channel|everyone)(?:\|[^>]*)?>/g;

export const collectSlackMentionedUserIds = (
  texts: readonly string[],
): string[] => [
  ...new Set(
    texts.flatMap((text) =>
      [...text.matchAll(SLACK_USER_MENTION_PATTERN)].map((match) => match[1]),
    ),
  ),
];

export const rewriteSlackMentions = ({
  text,
  userLabelBySlackUserId,
}: {
  text: string;
  userLabelBySlackUserId: ReadonlyMap<string, string>;
}): string =>
  text
    .replace(
      SLACK_USER_MENTION_PATTERN,
      (rawMention, slackUserId: string) =>
        userLabelBySlackUserId.get(slackUserId) ?? rawMention,
    )
    .replace(
      SLACK_CHANNEL_MENTION_PATTERN,
      (_rawMention, channelId: string, channelName: string | undefined) =>
        isNonEmptyString(channelName) ? `#${channelName}` : `#${channelId}`,
    )
    .replace(
      SLACK_USER_GROUP_MENTION_PATTERN,
      (_rawMention, groupId: string, groupHandle: string | undefined) => {
        if (!isNonEmptyString(groupHandle)) {
          return `@user-group ${groupId}`;
        }

        return groupHandle.startsWith('@') ? groupHandle : `@${groupHandle}`;
      },
    )
    .replace(
      SLACK_BROADCAST_MENTION_PATTERN,
      (_rawMention, keyword: string) => `@${keyword}`,
    );
