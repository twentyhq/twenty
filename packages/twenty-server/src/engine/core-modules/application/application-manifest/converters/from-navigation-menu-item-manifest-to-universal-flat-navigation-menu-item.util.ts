import {
  NavigationMenuItemType,
  NavigationSystemPage,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItemManifest } from 'twenty-shared/application';

import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';

export const fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem =
  ({
    navigationMenuItemManifest,
    applicationUniversalIdentifier,
    now,
  }: {
    navigationMenuItemManifest: NavigationMenuItemManifest;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatNavigationMenuItem => {
    return {
      universalIdentifier: navigationMenuItemManifest.universalIdentifier,
      applicationUniversalIdentifier,
      type: navigationMenuItemManifest.type,
      name: navigationMenuItemManifest.name ?? null,
      icon: navigationMenuItemManifest.icon ?? null,
      color: navigationMenuItemManifest.color ?? null,
      position: navigationMenuItemManifest.position,
      viewUniversalIdentifier:
        navigationMenuItemManifest.viewUniversalIdentifier ?? null,
      link: navigationMenuItemManifest.link ?? null,
      systemPage:
        navigationMenuItemManifest.type === NavigationMenuItemType.SYSTEM &&
        isDefined(navigationMenuItemManifest.systemPage) &&
        Object.values(NavigationSystemPage).includes(
          navigationMenuItemManifest.systemPage as NavigationSystemPage,
        )
          ? (navigationMenuItemManifest.systemPage as NavigationSystemPage)
          : null,
      folderUniversalIdentifier:
        navigationMenuItemManifest.folderUniversalIdentifier ?? null,
      targetObjectMetadataUniversalIdentifier:
        navigationMenuItemManifest.targetObjectUniversalIdentifier ?? null,
      pageLayoutUniversalIdentifier:
        navigationMenuItemManifest.pageLayoutUniversalIdentifier ?? null,
      targetRecordId: null,
      userWorkspaceId: null,
      createdAt: now,
      updatedAt: now,
    };
  };
