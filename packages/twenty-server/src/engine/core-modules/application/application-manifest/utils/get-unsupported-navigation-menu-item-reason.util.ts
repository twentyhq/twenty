import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { getUnresolvableObjectReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-object-reason.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const NAVIGATION_MENU_ITEM_LABEL =
  MANIFEST_ENTITY_REGISTRY.navigationMenuItem.entityKind;

// A reference the application owns but did not export resolves to nothing on a
// fresh install, and resolveUniversalRelationIdentifiersToIds throws rather
// than degrading. A reference to an engine-derived or foreign row is kept: its
// identifier is deterministic or belongs to an application installed alongside.
const getUnresolvableReferenceReason = <
  TFlatEntity extends SyncableFlatEntity,
>({
  referenceUniversalIdentifier,
  referenceMetadataName,
  applicationFlatEntityMaps,
  allFlatEntityMaps,
  exportedUniversalIdentifiers,
}: {
  referenceUniversalIdentifier: string | null;
  referenceMetadataName: AllMetadataName;
  applicationFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  allFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  exportedUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (!isDefined(referenceUniversalIdentifier)) {
    return undefined;
  }

  const referenceLabel =
    MANIFEST_ENTITY_REGISTRY[referenceMetadataName].entityKind;

  if (
    isDefined(
      applicationFlatEntityMaps.byUniversalIdentifier[
        referenceUniversalIdentifier
      ],
    ) &&
    !exportedUniversalIdentifiers.has(referenceUniversalIdentifier)
  ) {
    return `${NAVIGATION_MENU_ITEM_LABEL} on an unsupported ${referenceLabel}`;
  }

  if (
    !isDefined(
      allFlatEntityMaps.byUniversalIdentifier[referenceUniversalIdentifier],
    )
  ) {
    return `${NAVIGATION_MENU_ITEM_LABEL} on a ${referenceLabel} that does not exist`;
  }

  return undefined;
};

export const getUnsupportedNavigationMenuItemReason = ({
  flatNavigationMenuItem,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  exportedViewUniversalIdentifiers,
  exportedPageLayoutUniversalIdentifiers,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  exportedViewUniversalIdentifiers: ReadonlySet<string>;
  exportedPageLayoutUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined =>
  getUnresolvableObjectReason({
    metadataName: 'navigationMenuItem',
    objectUniversalIdentifier:
      flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers,
  }) ??
  getUnresolvableReferenceReason({
    referenceUniversalIdentifier:
      flatNavigationMenuItem.viewUniversalIdentifier,
    referenceMetadataName: 'view',
    applicationFlatEntityMaps: applicationAllFlatEntityMaps.flatViewMaps,
    allFlatEntityMaps: allFlatEntityMaps.flatViewMaps,
    exportedUniversalIdentifiers: exportedViewUniversalIdentifiers,
  }) ??
  getUnresolvableReferenceReason({
    referenceUniversalIdentifier:
      flatNavigationMenuItem.pageLayoutUniversalIdentifier,
    referenceMetadataName: 'pageLayout',
    applicationFlatEntityMaps: applicationAllFlatEntityMaps.flatPageLayoutMaps,
    allFlatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
    exportedUniversalIdentifiers: exportedPageLayoutUniversalIdentifiers,
  });
