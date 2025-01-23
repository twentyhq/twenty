import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import qs from 'qs';
import { generatePath, PathParam } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const getSettingsPath = <T extends SettingsPath>(
  to: T,
  params?: {
    [key in PathParam<`/${AppPath.Settings}/${T}`>]: string | null;
  },
  queryParams?: Record<string, any>,
) => {
  let path = `/${AppPath.Settings}/${to}`;

  if (isDefined(params)) {
    path = generatePath<`/${AppPath.Settings}/${T}`>(
      `/${AppPath.Settings}/${to}`,
      params,
    );
  }

  if (isDefined(queryParams)) {
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => isDefined(value)),
    );

    const queryString = qs.stringify(filteredParams);

    if (queryString !== '') {
      path += `?${queryString}`;
    }
  }

  return path;
};
