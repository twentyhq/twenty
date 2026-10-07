import { isNonEmptyString } from '@sniptt/guards';
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

  const link = new URL(computedLink, 'https://twenty.invalid');

  return (
    link.pathname === location.pathname &&
    (!isNonEmptyString(link.search) || link.search === location.search)
  );
};
