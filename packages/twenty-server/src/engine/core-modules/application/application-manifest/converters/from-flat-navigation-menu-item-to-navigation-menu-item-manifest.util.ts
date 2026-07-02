import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const fromFlatNavigationMenuItemToNavigationMenuItemManifest = ({
  flatNavigationMenuItem,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
}): NavigationMenuItemManifest => {
  return {
    universalIdentifier: flatNavigationMenuItem.universalIdentifier,
    type: flatNavigationMenuItem.type,
    position: flatNavigationMenuItem.position,
    ...(isDefined(flatNavigationMenuItem.name)
      ? { name: flatNavigationMenuItem.name }
      : {}),
    ...(isDefined(flatNavigationMenuItem.icon)
      ? { icon: flatNavigationMenuItem.icon }
      : {}),
    ...(isDefined(flatNavigationMenuItem.color)
      ? { color: flatNavigationMenuItem.color }
      : {}),
    ...(isDefined(flatNavigationMenuItem.viewUniversalIdentifier)
      ? { viewUniversalIdentifier: flatNavigationMenuItem.viewUniversalIdentifier }
      : {}),
    ...(isDefined(flatNavigationMenuItem.link)
      ? { link: flatNavigationMenuItem.link }
      : {}),
    ...(isDefined(flatNavigationMenuItem.folderUniversalIdentifier)
      ? {
          folderUniversalIdentifier:
            flatNavigationMenuItem.folderUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier)
      ? {
          targetObjectUniversalIdentifier:
            flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatNavigationMenuItem.pageLayoutUniversalIdentifier)
      ? {
          pageLayoutUniversalIdentifier:
            flatNavigationMenuItem.pageLayoutUniversalIdentifier,
        }
      : {}),
  };
};
