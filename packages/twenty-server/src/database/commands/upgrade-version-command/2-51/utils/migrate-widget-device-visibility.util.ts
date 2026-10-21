import { isArray } from '@sniptt/guards';
import { fastDeepEqual, isDefined, isPlainObject } from 'twenty-shared/utils';

import { LEGACY_WIDGET_DEVICE_VISIBILITIES } from 'src/database/commands/upgrade-version-command/2-51/constants/legacy-widget-device-visibilities.constant';
import { type WidgetVisibility } from 'src/database/commands/upgrade-version-command/2-51/types/widget-visibility.type';
import { rewriteLegacyDeviceConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/rewrite-legacy-device-conditional-display.util';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type WidgetVisibilityProperty =
  | 'conditionalDisplay'
  | 'conditionalAvailabilityExpression';

const findDeviceConditionalDisplay = (
  conditionalAvailabilityExpression: unknown,
) =>
  LEGACY_WIDGET_DEVICE_VISIBILITIES.find(
    (deviceVisibility) =>
      deviceVisibility.conditionalAvailabilityExpression ===
      conditionalAvailabilityExpression,
  )?.conditionalDisplay;

const migrateConditionalDisplay = (conditionalDisplay: unknown): unknown => {
  const rewrittenConditionalDisplay =
    rewriteLegacyDeviceConditionalDisplay(conditionalDisplay);

  if (
    !isDefined(rewrittenConditionalDisplay) ||
    (isPlainObject(rewrittenConditionalDisplay) &&
      isArray(rewrittenConditionalDisplay.recordFilters))
  ) {
    return rewrittenConditionalDisplay;
  }

  return null;
};

const readProperty = ({
  overrides,
  property,
  authorContext,
}: {
  overrides: unknown;
  property: WidgetVisibilityProperty;
  authorContext: OverrideAuthorContext;
}): unknown =>
  readAuthoredOverrideProperty({
    metadataName: 'pageLayoutWidget',
    overrides,
    path: [property],
    authorContext,
  });

export const migrateWidgetDeviceVisibility = ({
  conditionalDisplay,
  conditionalAvailabilityExpression,
  overrides,
  authorContext,
}: WidgetVisibility & {
  authorContext: OverrideAuthorContext;
}): WidgetVisibility & { nulledConditionalDisplays: unknown[] } => {
  const nulledConditionalDisplays: unknown[] = [];
  const migrateAndTrackConditionalDisplay = (value: unknown): unknown => {
    const migratedValue = migrateConditionalDisplay(value);

    if (isDefined(value) && migratedValue === null) {
      nulledConditionalDisplays.push(value);
    }

    return migratedValue;
  };

  const deviceConditionalDisplay = findDeviceConditionalDisplay(
    conditionalAvailabilityExpression,
  );
  const migratedBase = isDefined(deviceConditionalDisplay)
    ? {
        conditionalDisplay: deviceConditionalDisplay,
        conditionalAvailabilityExpression: null,
      }
    : {
        conditionalDisplay:
          migrateAndTrackConditionalDisplay(conditionalDisplay),
        conditionalAvailabilityExpression,
      };

  const authorOrder = computeOverrideAuthorOrder(authorContext);
  const authoredOverrides = normalizeAuthoredOverrides<Record<string, unknown>>(
    {
      metadataName: 'pageLayoutWidget',
      overrides,
      workspaceCustomApplicationUniversalIdentifier:
        authorContext.workspaceCustomApplicationUniversalIdentifier,
    },
  );

  const migratedOverrides = [...authorOrder]
    .reverse()
    .reduce<unknown>((currentOverrides, authorUniversalIdentifier) => {
      const authorEntryOverrides = {
        [authorUniversalIdentifier]:
          authoredOverrides?.[authorUniversalIdentifier],
      };
      const entryConditionalAvailabilityExpression = readProperty({
        overrides: authorEntryOverrides,
        property: 'conditionalAvailabilityExpression',
        authorContext,
      });
      const entryConditionalDisplay = readProperty({
        overrides: authorEntryOverrides,
        property: 'conditionalDisplay',
        authorContext,
      });
      const entryDeviceConditionalDisplay = findDeviceConditionalDisplay(
        entryConditionalAvailabilityExpression,
      );

      const dispatchToAuthorEntry = (updatedProperties: object) =>
        dispatchUpdateToAuthoredOverride({
          metadataName: 'pageLayoutWidget',
          updatedProperties,
          existingEntity: migratedBase,
          existingOverrides: currentOverrides,
          authorUniversalIdentifier,
          authorContext,
        }).overrides;

      if (
        entryConditionalAvailabilityExpression === null ||
        isDefined(entryDeviceConditionalDisplay)
      ) {
        const beneathAuthors = authorOrder.slice(
          authorOrder.indexOf(authorUniversalIdentifier) + 1,
        );
        const beneathConditionalAvailabilityExpression = readProperty({
          overrides: Object.fromEntries(
            beneathAuthors.map((beneathAuthor) => [
              beneathAuthor,
              isPlainObject(currentOverrides)
                ? currentOverrides[beneathAuthor]
                : undefined,
            ]),
          ),
          property: 'conditionalAvailabilityExpression',
          authorContext,
        });

        return dispatchToAuthorEntry({
          conditionalDisplay: entryDeviceConditionalDisplay ?? null,
          conditionalAvailabilityExpression:
            beneathConditionalAvailabilityExpression !== undefined
              ? beneathConditionalAvailabilityExpression
              : migratedBase.conditionalAvailabilityExpression,
        });
      }

      if (entryConditionalDisplay === undefined) {
        return currentOverrides;
      }

      const migratedEntryConditionalDisplay = migrateAndTrackConditionalDisplay(
        entryConditionalDisplay,
      );

      if (
        fastDeepEqual(migratedEntryConditionalDisplay, entryConditionalDisplay)
      ) {
        return currentOverrides;
      }

      return dispatchToAuthorEntry({
        conditionalDisplay: migratedEntryConditionalDisplay,
      });
    }, overrides);

  return {
    ...migratedBase,
    overrides: migratedOverrides,
    nulledConditionalDisplays,
  };
};
