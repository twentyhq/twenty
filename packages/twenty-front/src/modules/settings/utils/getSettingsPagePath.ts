import { SettingsPath } from '@/types/SettingsPath';

export const getSettingsPagePath = <Path extends SettingsPath>(path: Path) =>
  `/settings/${path}` as const;
