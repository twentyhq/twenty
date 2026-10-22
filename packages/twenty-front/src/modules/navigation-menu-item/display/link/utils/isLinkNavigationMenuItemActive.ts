import { parsePath } from 'react-router-dom';
import { isNonEmptyString } from '@sniptt/guards';
import { isSafeInternalPath } from 'twenty-shared/utils';

export const isLinkNavigationMenuItemActive = ({
  computedLink,
  location,
}: {
  computedLink: string;
  location: { pathname: string; search: string; hash?: string };
}): boolean => {
  if (!isSafeInternalPath(computedLink)) {
    return false;
  }

  const link = parsePath(computedLink);

  if (link.pathname !== location.pathname) {
    return false;
  }

  if (isNonEmptyString(link.hash) && link.hash !== location.hash) {
    return false;
  }

  const currentSearchParams = new URLSearchParams(location.search);

  return [...new URLSearchParams(link.search)].every(
    ([key, value]) => currentSearchParams.get(key) === value,
  );
};
