import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { fromLegacyPageLayoutWidgetRuleToConditionalAvailability } from 'src/database/commands/upgrade-version-command/2-63/utils/from-legacy-page-layout-widget-rule-to-conditional-availability.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-overrides-to-universal-overrides.util';
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

const LEGACY_RULE_PROPERTIES = [
  'conditionalAvailabilityExpression',
  'conditionalDisplay',
];

export const computePageLayoutWidgetWithCopiedConditionalAvailability = <
  TPageLayoutWidget extends PageLayoutWidgetRuleProperties,
>({
  flatPageLayoutWidget,
  workspaceCustomApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifierById,
  now,
}: {
  flatPageLayoutWidget: TPageLayoutWidget;
  workspaceCustomApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
  now: string;
}): {
  pageLayoutWidgetToUpdate: TPageLayoutWidget | undefined;
  unreadableRuleMessages: string[];
} => {
  const authorContext = {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier:
      flatPageLayoutWidget.applicationUniversalIdentifier,
  };

  // A null override is a cleared rule, so only undefined means the property is not overridden
  const isOverridden = (property: string): boolean =>
    readAuthoredOverrideProperty({
      metadataName: 'pageLayoutWidget',
      overrides: flatPageLayoutWidget.overrides,
      path: [property],
      authorContext,
    }) !== undefined;

  const hasOwnLegacyRule =
    isDefined(flatPageLayoutWidget.conditionalAvailabilityExpression) ||
    isDefined(flatPageLayoutWidget.conditionalDisplay);

  const ownRuleConversion =
    hasOwnLegacyRule && !isDefined(flatPageLayoutWidget.conditionalAvailability)
      ? fromLegacyPageLayoutWidgetRuleToConditionalAvailability(
          flatPageLayoutWidget,
        )
      : undefined;

  const copiedOwnNode =
    isDefined(ownRuleConversion) && ownRuleConversion.isValid
      ? ownRuleConversion.node
      : null;

  const pageLayoutWidgetWithCopiedOwnRule: TPageLayoutWidget = isDefined(
    copiedOwnNode,
  )
    ? { ...flatPageLayoutWidget, conditionalAvailability: copiedOwnNode }
    : flatPageLayoutWidget;

  const hasOverriddenLegacyRuleWithoutTree =
    LEGACY_RULE_PROPERTIES.some(isOverridden) &&
    !isOverridden('conditionalAvailability');

  const effectivePageLayoutWidget = resolveEffectiveFlatEntity({
    metadataName: 'pageLayoutWidget',
    flatEntity: flatPageLayoutWidget,
    authorContext: { workspaceCustomApplicationUniversalIdentifier },
  });

  const overriddenRuleConversion = hasOverriddenLegacyRuleWithoutTree
    ? fromLegacyPageLayoutWidgetRuleToConditionalAvailability(
        effectivePageLayoutWidget,
      )
    : undefined;

  const unreadableRuleMessages = [ownRuleConversion, overriddenRuleConversion]
    .filter(isDefined)
    .flatMap((conversion) =>
      conversion.isValid ? [] : [conversion.errorMessage],
    );

  if (!isDefined(overriddenRuleConversion) || !overriddenRuleConversion.isValid) {
    return {
      pageLayoutWidgetToUpdate:
        pageLayoutWidgetWithCopiedOwnRule === flatPageLayoutWidget
          ? undefined
          : { ...pageLayoutWidgetWithCopiedOwnRule, updatedAt: now },
      unreadableRuleMessages,
    };
  }

  // A null tree is written too: an override that cleared the rule must keep the widget visible once its own rule has a tree
  const { overrides } = dispatchUpdateToAuthoredOverride<
    { conditionalAvailability: ConditionalEvaluationNode | null },
    PageLayoutWidgetOverrides
  >({
    metadataName: 'pageLayoutWidget',
    updatedProperties: {
      conditionalAvailability: overriddenRuleConversion.node,
    },
    existingEntity: pageLayoutWidgetWithCopiedOwnRule,
    existingOverrides: flatPageLayoutWidget.overrides,
    authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
    authorContext,
  });

  if (
    pageLayoutWidgetWithCopiedOwnRule === flatPageLayoutWidget &&
    fastDeepEqual(overrides, flatPageLayoutWidget.overrides)
  ) {
    return { pageLayoutWidgetToUpdate: undefined, unreadableRuleMessages };
  }

  return {
    pageLayoutWidgetToUpdate: {
      ...pageLayoutWidgetWithCopiedOwnRule,
      overrides,
      universalOverrides: isDefined(overrides)
        ? fromPageLayoutWidgetOverridesToUniversalOverrides({
            overrides,
            pageLayoutTabUniversalIdentifierById,
          })
        : null,
      updatedAt: now,
    },
    unreadableRuleMessages,
  };
};
