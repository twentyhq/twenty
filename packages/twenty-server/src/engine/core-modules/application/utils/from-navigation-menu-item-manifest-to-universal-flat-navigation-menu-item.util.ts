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
      name: navigationMenuItemManifest.name ?? null,
      icon: navigationMenuItemManifest.icon ?? null,
      position: navigationMenuItemManifest.position,
      viewUniversalIdentifier:
        navigationMenuItemManifest.viewUniversalIdentifier ?? null,
      link: navigationMenuItemManifest.link ?? null,
      folderUniversalIdentifier:
        navigationMenuItemManifest.folderUniversalIdentifier ?? null,
      targetObjectMetadataUniversalIdentifier:
        navigationMenuItemManifest.targetObjectUniversalIdentifier ?? null,
      targetRecordId: null,
      userWorkspaceId: null,
      createdAt: now,
      updatedAt: now,
    };
  };
