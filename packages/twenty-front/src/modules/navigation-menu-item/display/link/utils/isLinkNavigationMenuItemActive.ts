import { parsePath } from 'react-router-dom';
import { isSafeInternalPath } from 'twenty-shared/utils';

export const isLinkNavigationMenuItemActive = ({
  computedLink,
  location,
}: {
  computedLink: string;
  location: { pathname: string; search: string };
}): boolean => {
  if (!isSafeInternalPath(computedLink)) {
    return false;
  }

  const link = parsePath(computedLink);

  if (link.pathname !== location.pathname) {
    return false;
  }

  const currentSearchParams = new URLSearchParams(location.search);

  return [...new URLSearchParams(link.search)].every(
    ([key, value]) => currentSearchParams.get(key) === value,
  );
};
