import { AppPath } from '@/types/AppPath';
import qs from 'qs';
import { generatePath, PathParam } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const getAppPath = <T extends AppPath>(
  to: T,
  params?: { [key in PathParam<T>]: string | null },
  queryParams?: Record<string, any>,
) => {
  let path: string = to;

  if (isDefined(params)) {
    path = generatePath<T>(to, params);
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
