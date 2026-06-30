import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getLinkNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'name' | 'link'>,
): string => {
  const linkUrl = (item.link ?? '').trim();
  return (item.name ?? linkUrl) || 'Link';
};
