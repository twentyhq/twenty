import { type PageLayoutManifest } from 'twenty-shared/application';

import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

export const fromPageLayoutManifestToUniversalFlatPageLayout = ({
  pageLayoutManifest,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutManifest: PageLayoutManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayout => {
  return {
    universalIdentifier: pageLayoutManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: pageLayoutManifest.name,
    type: pageLayoutManifest.type,
    objectMetadataUniversalIdentifier:
      pageLayoutManifest.objectUniversalIdentifier ?? null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
      pageLayoutManifest.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier ??
      null,
    navigationMenuItemUniversalIdentifiers: [],
    tabUniversalIdentifiers: [],
    isSystemSideEffect: false,
    isFirstTabPinned: true,
    // Manifests cannot ship slots; null is only the forward default, the workspace-owned sync keeps whatever the workspace saved.
    dashboardFilters: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
