import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { generatePath, PathParam } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

type AppPathType = AppPath | `${AppPath.Settings}/${SettingsPath}`;

export const appLink = <T extends AppPathType>(
  to: T,
  params?: { [key in PathParam<T>]: string | null },
) => {
  if (isDefined(params)) {
    return generatePath<T>(to, params);
  }
  return to;
};
