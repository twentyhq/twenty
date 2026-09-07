import { isDefined } from 'twenty-shared/utils';

import { computeViewFieldPositionsAlignedToStandard } from 'src/database/commands/upgrade-version-command/2-25/utils/compute-view-field-positions-aligned-to-standard.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const buildViewFieldsAlignedToStandardPositions = ({
  existingView,
  flatViewFieldMaps,
  standardFlatViewFieldMaps,
}: {
  existingView: FlatView;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  standardFlatViewFieldMaps: FlatEntityMaps<FlatViewField>;
}): FlatViewField[] => {
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
    .filter(isDefined);

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
    .filter((viewField): viewField is FlatViewField => isDefined(viewField));
};
