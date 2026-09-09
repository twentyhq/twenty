import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatNavigationMenuItemToNavigationMenuItemManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-navigation-menu-item-to-navigation-menu-item-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnsupportedNavigationMenuItemReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-navigation-menu-item-reason.util';
import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const NAVIGATION_MENU_ITEM_LABEL =
  MANIFEST_ENTITY_REGISTRY.navigationMenuItem.entityKind;

export const reconstructNavigationMenuItemsManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): {
  navigationMenuItems: NavigationMenuItemManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];
  const exportableFlatNavigationMenuItems: FlatNavigationMenuItem[] = [];

  for (const flatNavigationMenuItem of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatNavigationMenuItemMaps,
  )) {
    const { universalIdentifier, userWorkspaceId, targetRecordId } =
      flatNavigationMenuItem;

    if (isDefined(userWorkspaceId)) {
      coverage.push({
        metadataName: 'navigationMenuItem',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.EXCLUDED,
        reason: 'personal navigation item',
      });
      continue;
    }

    if (isDefined(targetRecordId)) {
      coverage.push({
        metadataName: 'navigationMenuItem',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.EXCLUDED,
        reason: 'navigation item pinned to a record',
      });
      continue;
    }

    const unsupportedReason = getUnsupportedNavigationMenuItemReason({
      flatNavigationMenuItem,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers,
    });

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName: 'navigationMenuItem',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });
      continue;
    }

    exportableFlatNavigationMenuItems.push(flatNavigationMenuItem);
  }

  const exportedUniversalIdentifiers = new Set(
    exportableFlatNavigationMenuItems.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );
  const isFolderExported = ({
    folderUniversalIdentifier,
  }: FlatNavigationMenuItem) =>
    !isDefined(folderUniversalIdentifier) ||
    exportedUniversalIdentifiers.has(folderUniversalIdentifier);

  // A folder is a navigation menu item too, so an item whose folder is not
  // exported would carry a reference the install cannot resolve. Dropping one
  // can orphan the items nested under it, hence the fixed point.
  let orphanedFlatNavigationMenuItems =
    exportableFlatNavigationMenuItems.filter(
      (flatNavigationMenuItem) => !isFolderExported(flatNavigationMenuItem),
    );

  while (orphanedFlatNavigationMenuItems.length > 0) {
    for (const { universalIdentifier } of orphanedFlatNavigationMenuItems) {
      exportedUniversalIdentifiers.delete(universalIdentifier);
      coverage.push({
        metadataName: 'navigationMenuItem',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: `${NAVIGATION_MENU_ITEM_LABEL} in a folder that is not exported`,
      });
    }

    orphanedFlatNavigationMenuItems = exportableFlatNavigationMenuItems.filter(
      (flatNavigationMenuItem) =>
        exportedUniversalIdentifiers.has(
          flatNavigationMenuItem.universalIdentifier,
        ) && !isFolderExported(flatNavigationMenuItem),
    );
  }

  const navigationMenuItems = exportableFlatNavigationMenuItems
    .filter(({ universalIdentifier }) =>
      exportedUniversalIdentifiers.has(universalIdentifier),
    )
    .map((flatNavigationMenuItem) => {
      coverage.push(
        buildExportedCoverageEntry({
          metadataName: 'navigationMenuItem',
          flatEntity: flatNavigationMenuItem,
        }),
      );

      return fromFlatNavigationMenuItemToNavigationMenuItemManifest({
        flatNavigationMenuItem,
      });
    });

  return { navigationMenuItems, coverage };
};
