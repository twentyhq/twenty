import { isDefined } from 'twenty-shared/utils';

import { computeViewFieldPositionsAlignedToStandard } from 'src/database/commands/upgrade-version-command/2-25/utils/compute-view-field-positions-aligned-to-standard.util';

type StandardViewField = {
  universalIdentifier: string;
  position: number;
  viewUniversalIdentifier: string;
};

type ExistingViewField = {
  universalIdentifier: string;
  position: number;
  deletedAt: string | null;
};

export const buildViewFieldsAlignedToStandardPositions = <
  TViewField extends ExistingViewField,
>({
  existingView,
  flatViewFieldMaps,
  standardFlatViewFieldMaps,
}: {
  existingView: {
    universalIdentifier: string;
    viewFieldUniversalIdentifiers: readonly string[];
  };
  flatViewFieldMaps: {
    byUniversalIdentifier: Partial<Record<string, TViewField>>;
  };
  standardFlatViewFieldMaps: {
    byUniversalIdentifier: Partial<Record<string, StandardViewField>>;
  };
}): TViewField[] => {
  const standardPositionByUniversalIdentifier = Object.fromEntries(
    Object.values(standardFlatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier === existingView.universalIdentifier,
      )
      .map(({ universalIdentifier, position }) => [
        universalIdentifier,
        position,
      ]),
  );

  const existingViewFields = existingView.viewFieldUniversalIdentifiers
    .map(
      (viewFieldUniversalIdentifier) =>
        flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
    )
    .filter(isDefined)
    .filter((viewField) => !isDefined(viewField.deletedAt));

  return computeViewFieldPositionsAlignedToStandard({
    existingViewFields: existingViewFields.map(
      ({ universalIdentifier, position }) => ({
        universalIdentifier,
        position,
      }),
    ),
    standardPositionByUniversalIdentifier,
  })
    .map(({ universalIdentifier, position }) => {
      const existingViewField =
        flatViewFieldMaps.byUniversalIdentifier[universalIdentifier];

      return isDefined(existingViewField)
        ? { ...existingViewField, position }
        : null;
    })
    .filter(isDefined);
};
