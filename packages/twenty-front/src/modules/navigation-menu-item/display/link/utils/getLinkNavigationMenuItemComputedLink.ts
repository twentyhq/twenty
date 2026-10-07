import { isNonEmptyString } from '@sniptt/guards';
import { ensureAbsoluteUrl, isSafeInternalPath } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getLinkNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'link'>,
): string => {
  const linkUrl = (item.link ?? '').trim();

  if (!isNonEmptyString(linkUrl)) {
    return '';
  }

  if (isSafeInternalPath(linkUrl)) {
    return linkUrl;
  }

  return ensureAbsoluteUrl(linkUrl).replace(/^https?:\/\//i, (scheme) =>
    scheme.toLowerCase(),
  );
};
