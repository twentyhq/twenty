import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const getUnsupportedNavigationMenuItemReason = ({
  flatNavigationMenuItem,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableViewUniversalIdentifiers,
  resolvablePageLayoutUniversalIdentifiers,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableViewUniversalIdentifiers: ReadonlySet<string>;
  resolvablePageLayoutUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined =>
  getUnresolvableReferenceReason({
    metadataName: 'navigationMenuItem',
    referenceMetadataName: 'objectMetadata',
    referenceUniversalIdentifier:
      flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    resolvableReferenceUniversalIdentifiers: exportedObjectUniversalIdentifiers,
  }) ??
  getUnresolvableReferenceReason({
    metadataName: 'navigationMenuItem',
    referenceMetadataName: 'view',
    referenceUniversalIdentifier:
      flatNavigationMenuItem.viewUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    resolvableReferenceUniversalIdentifiers: resolvableViewUniversalIdentifiers,
  }) ??
  getUnresolvableReferenceReason({
    metadataName: 'navigationMenuItem',
    referenceMetadataName: 'pageLayout',
    referenceUniversalIdentifier:
      flatNavigationMenuItem.pageLayoutUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    resolvableReferenceUniversalIdentifiers:
      resolvablePageLayoutUniversalIdentifiers,
  });
