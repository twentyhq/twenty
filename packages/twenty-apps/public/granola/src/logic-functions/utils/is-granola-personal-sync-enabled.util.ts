import { GRANOLA_PERSONAL_SYNC_ENABLED_ENV_VAR_NAME } from 'src/constants/granola-personal-connection.constant';

export const isGranolaPersonalSyncEnabled = (): boolean =>
  process.env[GRANOLA_PERSONAL_SYNC_ENABLED_ENV_VAR_NAME] === 'true';
