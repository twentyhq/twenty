import {
  getPageLayoutTabManifestLayoutMode,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from 'twenty-shared/application';

import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';

export const fromPageLayoutTabManifestToUniversalFlatPageLayoutTab = ({
  pageLayoutTabManifest,
  pageLayoutUniversalIdentifier,
  pageLayoutType,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutTabManifest: PageLayoutTabManifest;
  pageLayoutUniversalIdentifier: string;
  pageLayoutType: PageLayoutManifest['type'] | undefined;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutTab => {
  return {
    universalIdentifier: pageLayoutTabManifest.universalIdentifier,
    applicationUniversalIdentifier,
    title: pageLayoutTabManifest.title,
    position: pageLayoutTabManifest.position,
    pageLayoutUniversalIdentifier,
    icon: pageLayoutTabManifest.icon ?? null,
    layoutMode: getPageLayoutTabManifestLayoutMode({
      pageLayoutTabManifest,
      pageLayoutType,
    }),
    isActive: true,
    isSystemSideEffect: false,
    widgetUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    overrides: null,
  };
};
