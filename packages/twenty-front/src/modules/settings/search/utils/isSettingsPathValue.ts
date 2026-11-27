import { SettingsPath } from 'twenty-shared/types';

const SETTINGS_PATHS = new Set<string>(Object.values(SettingsPath));

export const isSettingsPathValue = (path: string): path is SettingsPath =>
  SETTINGS_PATHS.has(path);
