import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const isSlackUserLinkSource = (
  value: unknown,
): value is SlackUserLinkSource =>
  Object.values(SLACK_USER_LINK_SOURCE).some((source) => source === value);
