import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { UNREADABLE_RULE_CONDITIONAL_AVAILABILITY } from 'src/database/commands/upgrade-version-command/2-61/constants/unreadable-rule-conditional-availability.constant';
import { fromLegacyPageLayoutWidgetRuleToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-page-layout-widget-rule-to-conditional-availability.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-overrides-to-universal-overrides.util';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

type PageLayoutWidgetRuleProperties = Pick<
  FlatPageLayoutWidget,
  | 'conditionalAvailability'
  | 'conditionalAvailabilityExpression'
  | 'conditionalDisplay'
  | 'overrides'
  | 'universalOverrides'
  | 'applicationUniversalIdentifier'
  | 'updatedAt'
>;

type LegacyRuleProperties = Pick<
  FlatPageLayoutWidget,
  'conditionalAvailabilityExpression' | 'conditionalDisplay'
>;

const RULE_PROPERTIES = [
  'conditionalAvailability',
  'conditionalAvailabilityExpression',
  'conditionalDisplay',
];

const hasLegacyRule = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: LegacyRuleProperties): boolean =>
  isDefined(conditionalAvailabilityExpression) || isDefined(conditionalDisplay);

const convertLegacyRule = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: LegacyRuleProperties): {
  conditionalAvailability: ConditionalAvailabilityNode | null;
  unreadableRuleReason: string | null;
} => {
  const conversion = fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
    conditionalAvailabilityExpression,
    conditionalDisplay,
  });

  return conversion.isValid
    ? {
        conditionalAvailability: conversion.node,
        unreadableRuleReason: null,
      }
    : {
        conditionalAvailability: UNREADABLE_RULE_CONDITIONAL_AVAILABILITY,
        unreadableRuleReason: conversion.errorCode,
      };
};

const convertColumns = <
  TPageLayoutWidget extends PageLayoutWidgetRuleProperties,
>(
  flatPageLayoutWidget: TPageLayoutWidget,
): TPageLayoutWidget => {
  if (!hasLegacyRule(flatPageLayoutWidget)) {
    return flatPageLayoutWidget;
  }

  return {
    ...flatPageLayoutWidget,
    conditionalAvailability:
      convertLegacyRule(flatPageLayoutWidget).conditionalAvailability,
    conditionalAvailabilityExpression: null,
    conditionalDisplay: null,
  };
};

const moveRuleIntoAuthoredOverride = <
  TPageLayoutWidget extends PageLayoutWidgetRuleProperties,
>({
  pageLayoutWidget,
  conditionalAvailability,
  existingOverrides,
  authorContext,
  pageLayoutTabUniversalIdentifierById,
}: {
  pageLayoutWidget: TPageLayoutWidget;
  conditionalAvailability: ConditionalAvailabilityNode | null;
  existingOverrides: TPageLayoutWidget['overrides'];
  authorContext: OverrideAuthorContext;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
}): TPageLayoutWidget => {
  const { overrides } = dispatchUpdateToAuthoredOverride<
    {
      conditionalAvailability: ConditionalAvailabilityNode | null;
      conditionalAvailabilityExpression: null;
      conditionalDisplay: null;
    },
    PageLayoutWidgetOverrides
  >({
    metadataName: 'pageLayoutWidget',
    updatedProperties: {
      conditionalAvailability,
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    },
    existingEntity: pageLayoutWidget,
    existingOverrides,
    authorUniversalIdentifier:
      authorContext.workspaceCustomApplicationUniversalIdentifier,
    authorContext,
  });

  return {
    ...pageLayoutWidget,
    overrides,
    universalOverrides: isDefined(overrides)
      ? fromPageLayoutWidgetOverridesToUniversalOverrides({
          overrides,
          pageLayoutTabUniversalIdentifierById,
        })
      : null,
  };
};

export const computePageLayoutWidgetWithConditionalAvailability = <
  TPageLayoutWidget extends PageLayoutWidgetRuleProperties,
>({
  flatPageLayoutWidget,
  standardConditionalAvailability,
  workspaceCustomApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifierById,
  now,
}: {
  flatPageLayoutWidget: TPageLayoutWidget;
  standardConditionalAvailability?: ConditionalAvailabilityNode | null;
  workspaceCustomApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
  now: string;
}): {
  flatPageLayoutWidget: TPageLayoutWidget;
  unreadableRuleReason: string | null;
} | null => {
  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      flatPageLayoutWidget.applicationUniversalIdentifier,
  };

  const effectivePageLayoutWidget = resolveEffectiveFlatEntity({
    metadataName: 'pageLayoutWidget',
    flatEntity: flatPageLayoutWidget,
    authorContext: { workspaceCustomApplicationUniversalIdentifier },
  });

  const isStandardRuleRestored =
    !hasLegacyRule(flatPageLayoutWidget) &&
    !isDefined(flatPageLayoutWidget.conditionalAvailability) &&
    isDefined(standardConditionalAvailability);

  const pageLayoutWidgetWithStandardRule: TPageLayoutWidget =
    isStandardRuleRestored
      ? {
          ...flatPageLayoutWidget,
          conditionalAvailability: standardConditionalAvailability,
        }
      : flatPageLayoutWidget;

  if (
    !hasLegacyRule(flatPageLayoutWidget) &&
    !hasLegacyRule(effectivePageLayoutWidget) &&
    !isStandardRuleRestored
  ) {
    return null;
  }

  const displayedRule = hasLegacyRule(effectivePageLayoutWidget)
    ? convertLegacyRule(effectivePageLayoutWidget)
    : {
        conditionalAvailability:
          effectivePageLayoutWidget.conditionalAvailability,
        unreadableRuleReason: null,
      };

  const pageLayoutWidgetWithConvertedColumns = convertColumns(
    pageLayoutWidgetWithStandardRule,
  );

  const isRuleOverridden = RULE_PROPERTIES.some(
    (property) =>
      readAuthoredOverrideProperty({
        metadataName: 'pageLayoutWidget',
        overrides: flatPageLayoutWidget.overrides,
        path: [property],
        authorContext,
      }) !== undefined,
  );

  const convertedPageLayoutWidget = isRuleOverridden
    ? moveRuleIntoAuthoredOverride({
        pageLayoutWidget: pageLayoutWidgetWithConvertedColumns,
        conditionalAvailability: displayedRule.conditionalAvailability,
        existingOverrides: flatPageLayoutWidget.overrides,
        authorContext,
        pageLayoutTabUniversalIdentifierById,
      })
    : pageLayoutWidgetWithConvertedColumns;

  if (fastDeepEqual(convertedPageLayoutWidget, flatPageLayoutWidget)) {
    return null;
  }

  return {
    flatPageLayoutWidget: { ...convertedPageLayoutWidget, updatedAt: now },
    unreadableRuleReason: displayedRule.unreadableRuleReason,
  };
};
