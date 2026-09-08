import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

export const getUnsupportedPageLayoutReason = ({
  flatPageLayout,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  flatPageLayout: FlatPageLayout;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (!isNonEmptyString(flatPageLayout.name)) {
    return 'page layout without a name';
  }

  const objectUniversalIdentifier =
    flatPageLayout.objectMetadataUniversalIdentifier;

  if (isDefined(objectUniversalIdentifier)) {
    if (
      isDefined(
        applicationAllFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier[objectUniversalIdentifier],
      ) &&
      !exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)
    ) {
      return 'page layout on an unsupported object';
    }

    if (
      !isDefined(
        allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          objectUniversalIdentifier
        ],
      )
    ) {
      return 'page layout on an object that does not exist';
    }
  }

  const defaultTabUniversalIdentifier =
    flatPageLayout.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier;

  if (isDefined(defaultTabUniversalIdentifier)) {
    const defaultTab =
      applicationAllFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        defaultTabUniversalIdentifier
      ];

    if (
      !isDefined(defaultTab) ||
      defaultTab.isSystemSideEffect ||
      defaultTab.pageLayoutUniversalIdentifier !==
        flatPageLayout.universalIdentifier
    ) {
      return 'page layout whose default tab is not exported';
    }
  }

  return undefined;
};
