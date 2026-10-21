import { fastDeepEqual, isDefined, isPlainObject } from 'twenty-shared/utils';

import { LEGACY_WIDGET_DEVICE_VISIBILITIES } from 'src/database/commands/upgrade-version-command/2-51/constants/legacy-widget-device-visibilities.constant';
import { type WidgetVisibility } from 'src/database/commands/upgrade-version-command/2-51/types/widget-visibility.type';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { readAuthoredOverrideEntry } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-entry.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

const findDeviceConditionalAvailabilityExpression = (
  conditionalDisplay: unknown,
) =>
  LEGACY_WIDGET_DEVICE_VISIBILITIES.find((deviceVisibility) =>
    fastDeepEqual(deviceVisibility.conditionalDisplay, conditionalDisplay),
  )?.conditionalAvailabilityExpression;

const isDeviceConditionalAvailabilityExpression = (
  conditionalAvailabilityExpression: unknown,
) =>
  LEGACY_WIDGET_DEVICE_VISIBILITIES.some(
    (deviceVisibility) =>
      deviceVisibility.conditionalAvailabilityExpression ===
      conditionalAvailabilityExpression,
  );

export const revertWidgetDeviceVisibility = ({
  conditionalDisplay,
  conditionalAvailabilityExpression,
  overrides,
  authorContext,
}: WidgetVisibility & {
  authorContext: OverrideAuthorContext;
}): WidgetVisibility => {
  const deviceConditionalAvailabilityExpression =
    findDeviceConditionalAvailabilityExpression(conditionalDisplay);
  const revertedBase = isDefined(deviceConditionalAvailabilityExpression)
    ? {
        conditionalDisplay: null,
        conditionalAvailabilityExpression:
          deviceConditionalAvailabilityExpression,
      }
    : { conditionalDisplay, conditionalAvailabilityExpression };

  const authorOrder = computeOverrideAuthorOrder(authorContext);

  const revertedOverrides = [...authorOrder]
    .reverse()
    .reduce<unknown>((currentOverrides, authorUniversalIdentifier) => {
      const entryConditionalDisplay = readAuthoredOverrideProperty({
        metadataName: 'pageLayoutWidget',
        overrides: {
          [authorUniversalIdentifier]: readAuthoredOverrideEntry({
            metadataName: 'pageLayoutWidget',
            overrides,
            authorUniversalIdentifier,
            workspaceCustomApplicationUniversalIdentifier:
              authorContext.workspaceCustomApplicationUniversalIdentifier,
          }),
        },
        path: ['conditionalDisplay'],
        authorContext,
      });
      const entryDeviceConditionalAvailabilityExpression =
        findDeviceConditionalAvailabilityExpression(entryConditionalDisplay);

      const dispatchToAuthorEntry = (updatedProperties: object) =>
        dispatchUpdateToAuthoredOverride({
          metadataName: 'pageLayoutWidget',
          updatedProperties,
          existingEntity: revertedBase,
          existingOverrides: currentOverrides,
          authorUniversalIdentifier,
          authorContext,
        }).overrides;

      if (isDefined(entryDeviceConditionalAvailabilityExpression)) {
        return dispatchToAuthorEntry({
          conditionalDisplay: null,
          conditionalAvailabilityExpression:
            entryDeviceConditionalAvailabilityExpression,
        });
      }

      if (entryConditionalDisplay !== null) {
        return currentOverrides;
      }

      const beneathAuthors = authorOrder.slice(
        authorOrder.indexOf(authorUniversalIdentifier) + 1,
      );
      const beneathConditionalAvailabilityExpression =
        readAuthoredOverrideProperty({
          metadataName: 'pageLayoutWidget',
          overrides: Object.fromEntries(
            beneathAuthors.map((beneathAuthor) => [
              beneathAuthor,
              isPlainObject(currentOverrides)
                ? currentOverrides[beneathAuthor]
                : undefined,
            ]),
          ),
          path: ['conditionalAvailabilityExpression'],
          authorContext,
        });
      const effectiveBeneathConditionalAvailabilityExpression =
        beneathConditionalAvailabilityExpression !== undefined
          ? beneathConditionalAvailabilityExpression
          : revertedBase.conditionalAvailabilityExpression;

      if (
        !isDeviceConditionalAvailabilityExpression(
          effectiveBeneathConditionalAvailabilityExpression,
        )
      ) {
        return currentOverrides;
      }

      return dispatchToAuthorEntry({
        conditionalDisplay: null,
        conditionalAvailabilityExpression: null,
      });
    }, overrides);

  return { ...revertedBase, overrides: revertedOverrides };
};
