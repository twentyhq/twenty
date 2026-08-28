export const SLACK_UNFURL_OBJECT_NAMES = [
  'person',
  'company',
  'opportunity',
  'note',
  'task',
] as const;

export type SlackUnfurlObjectName = (typeof SLACK_UNFURL_OBJECT_NAMES)[number];
