export const SLACK_REQUIRE_USER_MAPPING_ENV_VAR = 'SLACK_REQUIRE_USER_MAPPING';

export const isSlackUserMappingRequired = (): boolean =>
  process.env[SLACK_REQUIRE_USER_MAPPING_ENV_VAR]?.toLowerCase() === 'true';
