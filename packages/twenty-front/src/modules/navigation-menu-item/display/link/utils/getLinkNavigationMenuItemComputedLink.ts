import { ensureAbsoluteUrl, isSafeInternalPath } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getLinkNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'link'>,
): string => {
  const linkUrl = (item.link ?? '').trim();

  if (linkUrl === '') {
    return '';
  }

  return isSafeInternalPath(linkUrl) ? linkUrl : ensureAbsoluteUrl(linkUrl);
};
