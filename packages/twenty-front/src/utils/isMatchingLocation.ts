import { type Location } from 'react-router-dom';

import { type AppBasePath } from 'twenty-shared/types';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const isMatchingLocation = (
  location: Location,
  path: string,
  basePath?: AppBasePath,
): boolean => isMatchingPathname(location.pathname, path, basePath);
