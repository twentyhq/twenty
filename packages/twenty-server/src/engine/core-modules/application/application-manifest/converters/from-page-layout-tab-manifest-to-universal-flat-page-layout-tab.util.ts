import { type NormalizedPageLayoutTabManifest } from 'twenty-shared/application';

import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';

export const fromPageLayoutTabManifestToUniversalFlatPageLayoutTab = ({
  pageLayoutTabManifest,
  pageLayoutUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutTabManifest: NormalizedPageLayoutTabManifest;
  pageLayoutUniversalIdentifier: string;
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
    layoutMode: pageLayoutTabManifest.layoutMode,
    universalConditionalDisplay: normalizeConditionalDisplay(
      pageLayoutTabManifest.conditionalDisplay,
    ),
    isActive: true,
    isSystemSideEffect: false,
    widgetUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalOverrides: null,
  };
};
