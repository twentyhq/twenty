import type {
  CreateNavigationMenuItemInput,
  NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

export const buildCreateNavigationMenuItemInput = (
  draftItem: NavigationMenuItem,
  resolveFolderId: (draftFolderId: string) => string,
): CreateNavigationMenuItemInput => {
  const input: CreateNavigationMenuItemInput = {
    position: draftItem.position,
  };

  if (isNavigationMenuItemFolder(draftItem)) {
    input.name = draftItem.name ?? undefined;
    input.icon = draftItem.icon ?? null;
  } else if (isNavigationMenuItemLink(draftItem)) {
    input.name = draftItem.name ?? 'Link';
    const linkUrl = (draftItem.link ?? '').trim();
    input.link =
      linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
        ? linkUrl
        : linkUrl
          ? `https://${linkUrl}`
          : undefined;
  } else if (isDefined(draftItem.viewId)) {
    input.viewId = draftItem.viewId;
  } else if (isDefined(draftItem.targetRecordId)) {
    input.targetRecordId = draftItem.targetRecordId;
    input.targetObjectMetadataId =
      draftItem.targetObjectMetadataId ?? undefined;
  }

  if (isDefined(draftItem.folderId)) {
    input.folderId = resolveFolderId(draftItem.folderId);
  }

  if (isDefined(draftItem.color)) {
    input.color = draftItem.color;
  }

  return input;
};
