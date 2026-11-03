import { type UniversalConditionalDisplay } from 'twenty-shared/types';

import { type FindObjectFieldByName } from 'src/engine/core-modules/application/application-manifest/types/find-object-field-by-name.type';
import { type LegacyPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/types/legacy-page-layout-widget-manifest.type';
import { resolveLegacyConditionalDisplayOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/resolve-legacy-conditional-display-or-throw.util';
import { isLegacyJsonLogicConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-legacy-json-logic-conditional-display.util';
import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  applicationUniversalIdentifier,
  findObjectFieldByName,
  now,
}: {
  pageLayoutWidgetManifest: LegacyPageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  findObjectFieldByName: FindObjectFieldByName;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  return {
    universalIdentifier: pageLayoutWidgetManifest.universalIdentifier,
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: pageLayoutWidgetManifest.title,
    isActive: true,
    isSystemSideEffect: false,
    type: pageLayoutWidgetManifest.type,
    objectMetadataUniversalIdentifier:
      pageLayoutWidgetManifest.objectUniversalIdentifier ?? null,
    universalConditionalDisplay: normalizeConditionalDisplay(
      isLegacyJsonLogicConditionalDisplay(
        pageLayoutWidgetManifest.conditionalDisplay,
      )
        ? resolveLegacyConditionalDisplayOrThrow({
            loggerContext: 'PageLayoutWidgetManifestConverter',
            entityLabel: `Page layout widget "${pageLayoutWidgetManifest.title}"`,
            legacyPropertyName: 'json-logic conditionalDisplay',
            legacyConditionalDisplay:
              pageLayoutWidgetManifest.conditionalDisplay,
            objectUniversalIdentifier:
              pageLayoutWidgetManifest.objectUniversalIdentifier,
            findObjectFieldByName,
          })
        : (pageLayoutWidgetManifest.conditionalDisplay as
            | UniversalConditionalDisplay
            | undefined),
    ),
    position: pageLayoutWidgetManifest.position,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalConditionalAvailability: null,
    universalOverrides: null,
  };
};
