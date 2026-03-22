import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const AI_ADMIN_PATH = getSettingsPath(
  SettingsPath.AdminPanel,
  undefined,
  undefined,
  'ai',
);
