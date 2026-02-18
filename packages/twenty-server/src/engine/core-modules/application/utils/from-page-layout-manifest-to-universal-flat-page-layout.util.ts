import { type PageLayoutManifest } from 'twenty-shared/application';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
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
    type:
      (pageLayoutManifest.type as PageLayoutType) ?? PageLayoutType.RECORD_PAGE,
    objectMetadataUniversalIdentifier:
      pageLayoutManifest.objectUniversalIdentifier ?? null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
      pageLayoutManifest.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier ??
      null,
    tabUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
