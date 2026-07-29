export const SLACK_CHANNEL_MODE = {
  OPEN: 'OPEN',
  READ_ONLY: 'READ_ONLY',
  SILENT: 'SILENT',
} as const;

export type SlackChannelMode =
  (typeof SLACK_CHANNEL_MODE)[keyof typeof SLACK_CHANNEL_MODE];
