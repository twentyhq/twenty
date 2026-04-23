import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

type ConfigKey = keyof ConfigVariables;

export const TEST_KEY_DEFAULT: ConfigKey = 'IS_ATTACHMENT_PREVIEW_ENABLED';
export const TEST_KEY_NOTIFICATION: ConfigKey =
  'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION';
export const TEST_KEY_SOFT_DELETION: ConfigKey =
  'WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION';
export const TEST_KEY_DELETION: ConfigKey =
  'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION';
export const TEST_KEY_METRICS: ConfigKey =
  'HEALTH_METRICS_TIME_WINDOW_IN_MINUTES';
export const TEST_KEY_ENV_ONLY: ConfigKey = 'PG_DATABASE_URL';
export const TEST_KEY_NONEXISTENT = 'NONEXISTENT_CONFIG_KEY';
export const TEST_KEY_STRING_VALUE: ConfigKey = 'EMAIL_FROM_NAME';
