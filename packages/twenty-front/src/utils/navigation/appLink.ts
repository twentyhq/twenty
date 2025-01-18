import { AppPath } from '@/types/AppPath';
import { generatePath, PathParam } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const appLink = <T extends AppPath>(
  to: T,
  params?: { [key in PathParam<T>]: string | null },
) => {
  if (isDefined(params)) {
    return generatePath<T>(to, params);
  }
  return to;
};
