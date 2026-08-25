export const SLACK_ACCESS_MODE = {
  ANYONE: 'ANYONE',
  ONLY_LINKED_MEMBERS: 'ONLY_LINKED_MEMBERS',
} as const;

export type SlackAccessMode =
  (typeof SLACK_ACCESS_MODE)[keyof typeof SLACK_ACCESS_MODE];

export const SLACK_ACCESS_MODE_KV_KEY = 'slack-access-mode';
