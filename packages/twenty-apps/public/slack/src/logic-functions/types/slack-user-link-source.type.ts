import { type SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';

export type SlackUserLinkSource =
  (typeof SLACK_USER_LINK_SOURCE)[keyof typeof SLACK_USER_LINK_SOURCE];
