export const SLACK_USER_MAPPING_SOURCE = {
  AUTO: 'auto',
  MANUAL: 'manual',
} as const;

export type SlackUserMappingSource =
  (typeof SLACK_USER_MAPPING_SOURCE)[keyof typeof SLACK_USER_MAPPING_SOURCE];
