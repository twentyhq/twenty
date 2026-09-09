import { isDefined } from 'twenty-shared/utils';

import { getUnresolvableObjectReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-object-reason.util';
import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const NAVIGATION_MENU_ITEM_LABEL =
  MANIFEST_ENTITY_REGISTRY.navigationMenuItem.entityKind;

export const getUnsupportedNavigationMenuItemReason = ({
  flatNavigationMenuItem,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  const unresolvableObjectReason = getUnresolvableObjectReason({
    metadataName: 'navigationMenuItem',
    objectUniversalIdentifier:
      flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers,
  });

  if (isDefined(unresolvableObjectReason)) {
    return unresolvableObjectReason;
  }

  const { viewUniversalIdentifier, pageLayoutUniversalIdentifier } =
    flatNavigationMenuItem;

  if (
    isDefined(viewUniversalIdentifier) &&
    !isDefined(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        viewUniversalIdentifier
      ],
    )
  ) {
    return `${NAVIGATION_MENU_ITEM_LABEL} on a view that does not exist`;
  }

  if (
    isDefined(pageLayoutUniversalIdentifier) &&
    !isDefined(
      allFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier[
        pageLayoutUniversalIdentifier
      ],
    )
  ) {
    return `${NAVIGATION_MENU_ITEM_LABEL} on a page layout that does not exist`;
  }

  return undefined;
};
