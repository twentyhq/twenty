import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
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

  const unresolvableObjectReason = getUnresolvableReferenceReason({
    metadataName: 'pageLayout',
    referenceMetadataName: 'objectMetadata',
    referenceUniversalIdentifier:
      flatPageLayout.objectMetadataUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    resolvableReferenceUniversalIdentifiers: exportedObjectUniversalIdentifiers,
  });

  if (isDefined(unresolvableObjectReason)) {
    return unresolvableObjectReason;
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
