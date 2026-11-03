import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type LegacyWidgetJsonLogicField } from 'src/engine/metadata-modules/flat-conditional-display/types/legacy-widget-json-logic-field.type';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { isLegacyJsonLogicConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-legacy-json-logic-conditional-display.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { dispatchUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-update-to-authored-override.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';

export const migrateConditionalDisplayOverrides = ({
  overrides,
  conditionalDisplay,
  authorContext,
  resolveField,
}: {
  overrides: FlatPageLayoutWidget['overrides'];
  conditionalDisplay: FlatPageLayoutWidget['conditionalDisplay'];
  authorContext: OverrideAuthorContext;
  resolveField: (fieldName: string) => LegacyWidgetJsonLogicField | undefined;
}): {
  overrides: FlatPageLayoutWidget['overrides'];
  convertedOverrideEntryCount: number;
} => {
  const authoredOverrides = normalizeAuthoredOverrides<Record<string, unknown>>(
    {
      metadataName: 'pageLayoutWidget',
      overrides,
      workspaceCustomApplicationUniversalIdentifier:
        authorContext.workspaceCustomApplicationUniversalIdentifier,
    },
  );

  if (!isDefined(authoredOverrides)) {
    return { overrides, convertedOverrideEntryCount: 0 };
  }

  const authorOrder = computeOverrideAuthorOrder(authorContext);
  const authorsFromLowestPriority = [
    ...Object.keys(authoredOverrides).filter(
      (author) => !authorOrder.includes(author),
    ),
    ...[...authorOrder].reverse(),
  ];

  let migratedOverrides: Record<string, unknown> | null = authoredOverrides;
  let convertedOverrideEntryCount = 0;

  for (const author of authorsFromLowestPriority) {
    const entry: unknown = migratedOverrides?.[author];

    if (
      !isPlainObject(entry) ||
      !isLegacyJsonLogicConditionalDisplay(entry.conditionalDisplay)
    ) {
      continue;
    }

    migratedOverrides = dispatchUpdateToAuthoredOverride({
      metadataName: 'pageLayoutWidget',
      updatedProperties: {
        conditionalDisplay: compileLegacyWidgetJsonLogic({
          jsonLogic: entry.conditionalDisplay,
          resolveField,
        }),
      },
      existingEntity: { conditionalDisplay },
      existingOverrides: migratedOverrides,
      authorUniversalIdentifier: author,
      authorContext,
    }).overrides;
    convertedOverrideEntryCount += 1;
  }

  return {
    overrides:
      convertedOverrideEntryCount === 0
        ? overrides
        : (migratedOverrides as FlatPageLayoutWidget['overrides']),
    convertedOverrideEntryCount,
  };
};
