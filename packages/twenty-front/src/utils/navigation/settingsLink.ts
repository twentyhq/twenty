import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { generatePath, PathParam } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const settingsLink = <T extends SettingsPath>(
  to: T,
  params?: { [key in PathParam<`/${AppPath.Settings}/${T}`>]: string | null },
) => {
  if (isDefined(params)) {
    return generatePath<`/${AppPath.Settings}/${T}`>(
      `/${AppPath.Settings}/${to}`,
      params,
    );
  }

  return `/${AppPath.Settings}/${to}`;
};
