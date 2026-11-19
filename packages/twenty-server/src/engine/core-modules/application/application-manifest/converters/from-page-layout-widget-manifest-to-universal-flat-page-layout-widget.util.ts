import { type NormalizedPageLayoutWidgetManifest } from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { fromLegacyPageLayoutWidgetRuleToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-page-layout-widget-rule-to-conditional-availability.util';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  pageLayoutWidgetManifest: NormalizedPageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPageLayoutWidget => {
  const ruleConversion =
    fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
      conditionalAvailabilityExpression: null,
      conditionalDisplay: pageLayoutWidgetManifest.conditionalDisplay,
    });

  if (!ruleConversion.isValid) {
    throw new ApplicationException(
      `Page layout widget "${pageLayoutWidgetManifest.title}" has an invalid visibility rule: ${ruleConversion.errorMessage}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

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
    conditionalAvailability: ruleConversion.node,
    conditionalDisplay: null,
    position: pageLayoutWidgetManifest.position,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalAvailabilityExpression: null,
    universalOverrides: null,
  };
};
