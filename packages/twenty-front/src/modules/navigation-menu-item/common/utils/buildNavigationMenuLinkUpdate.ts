import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// Normalizes a link rename/url edit: a blank name falls back to "Link", and a
// blank url is ignored so the existing link is kept.
export const buildNavigationMenuLinkUpdate = (updates: {
  name?: string;
  link?: string;
}): Partial<NavigationMenuItem> => {
  const normalized: Partial<NavigationMenuItem> = {};

  if (updates.name !== undefined) {
    normalized.name = updates.name.trim() || 'Link';
  }

  if (updates.link !== undefined && updates.link.trim() !== '') {
    normalized.link = updates.link.trim();
  }

  return normalized;
};
