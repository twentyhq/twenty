import { type PageLayoutManifest } from 'twenty-shared/application';
import { type PageLayoutType } from 'twenty-shared/types';

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
    type: pageLayoutManifest.type as PageLayoutType,
    objectMetadataUniversalIdentifier:
      pageLayoutManifest.objectUniversalIdentifier ?? null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
      pageLayoutManifest.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier ??
      null,
    tabUniversalIdentifiers: [],
    isSystemSideEffect: false,
    isFirstTabPinned: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
