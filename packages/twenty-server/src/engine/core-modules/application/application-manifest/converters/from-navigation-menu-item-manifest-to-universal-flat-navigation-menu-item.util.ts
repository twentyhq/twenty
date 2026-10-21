import { type NavigationMenuItemManifest } from 'twenty-shared/application';

import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';
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
      universalConditionalDisplay: normalizeConditionalDisplay(
        navigationMenuItemManifest.conditionalDisplay,
      ),
      viewUniversalIdentifier:
        navigationMenuItemManifest.viewUniversalIdentifier ?? null,
      link: navigationMenuItemManifest.link ?? null,
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
