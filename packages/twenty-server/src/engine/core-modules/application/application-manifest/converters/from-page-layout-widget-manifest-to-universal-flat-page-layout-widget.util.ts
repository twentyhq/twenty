import { type NormalizedPageLayoutWidgetManifest } from 'twenty-shared/application';
import { validateConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';

import { fromLegacyJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-json-logic-to-conditional-availability.util';
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
  const conditionalDisplay =
    pageLayoutWidgetManifest.conditionalDisplay ?? null;

  const conditionalAvailabilityFromJsonLogic =
    fromLegacyJsonLogicToConditionalAvailability(conditionalDisplay);

  // TODO(@neo773): a manifest declares its rule as json-logic, so the tree is filled from it; without this a sync empties the tree of the widget
  const conditionalAvailability =
    isDefined(conditionalAvailabilityFromJsonLogic) &&
    validateConditionalEvaluationNode({
      node: conditionalAvailabilityFromJsonLogic,
      metadataName: 'pageLayoutWidget',
    }).isValid
      ? conditionalAvailabilityFromJsonLogic
      : null;

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
    conditionalDisplay,
    position: pageLayoutWidgetManifest.position,
    universalConfiguration:
      pageLayoutWidgetManifest.configuration as UniversalFlatPageLayoutWidget['universalConfiguration'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalAvailabilityExpression: null,
    conditionalAvailability,
    universalOverrides: null,
  };
};
