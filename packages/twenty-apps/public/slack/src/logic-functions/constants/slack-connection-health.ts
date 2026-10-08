export const SLACK_CONNECTION_HEALTH = {
  OK: 'ok',
  TOKEN_REJECTED: 'token_rejected',
  TEAM_UNCLAIMED: 'team_unclaimed',
  TEAM_CLAIMED_BY_ANOTHER_WORKSPACE: 'team_claimed_by_another_workspace',
} as const;

export type SlackConnectionHealth =
  (typeof SLACK_CONNECTION_HEALTH)[keyof typeof SLACK_CONNECTION_HEALTH];
