export const SLACK_USER_LINK_SOURCE = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
} as const;

export type SlackUserLinkSource =
  (typeof SLACK_USER_LINK_SOURCE)[keyof typeof SLACK_USER_LINK_SOURCE];
