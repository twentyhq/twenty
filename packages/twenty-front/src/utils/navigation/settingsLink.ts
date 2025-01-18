import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { PathParam } from 'react-router-dom';
import { appLink } from '~/utils/navigation/appLink';

export const settingsLink = <T extends SettingsPath>(
  to: T,
  params?: { [key in PathParam<`${AppPath.Settings}/${T}`>]: string | null },
) => {
  return appLink(`${AppPath.Settings}/${to}`, params);
};
