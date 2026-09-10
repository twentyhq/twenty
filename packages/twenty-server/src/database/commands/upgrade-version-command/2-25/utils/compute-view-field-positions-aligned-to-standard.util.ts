type ViewFieldPosition = {
  universalIdentifier: string;
  position: number;
};

// The label identifier's column has to sit strictly below every other column of
// its view. Placing the incoming column below the current lowest position
// satisfies that once but does not survive: viewField.position is compared by
// the standard-application sync, so a position that differs from the standard
// one gets pulled back and trips the same validation again.
//
// Aligning the view to the standard layout leaves the sync with nothing to do.
// Columns the standard application does not know about keep their relative
// order and move above the standard ones, so they cannot tie with the label
// identifier either.
export const computeViewFieldPositionsAlignedToStandard = ({
  existingViewFields,
  standardPositionByUniversalIdentifier,
}: {
  existingViewFields: ViewFieldPosition[];
  standardPositionByUniversalIdentifier: Record<string, number>;
}): ViewFieldPosition[] => {
  const standardPositions = Object.values(standardPositionByUniversalIdentifier);

  if (standardPositions.length === 0) {
    return [];
  }

  const highestStandardPosition = Math.max(...standardPositions);

  const customUniversalIdentifiers = existingViewFields
    .filter(
      ({ universalIdentifier }) =>
        standardPositionByUniversalIdentifier[universalIdentifier] === undefined,
    )
    .sort((a, b) => a.position - b.position)
    .map(({ universalIdentifier }) => universalIdentifier);

  return existingViewFields.flatMap(({ universalIdentifier, position }) => {
    const standardPosition =
      standardPositionByUniversalIdentifier[universalIdentifier];

    const targetPosition =
      standardPosition ??
      highestStandardPosition +
        1 +
        customUniversalIdentifiers.indexOf(universalIdentifier);

    return targetPosition === position
      ? []
      : [{ universalIdentifier, position: targetPosition }];
  });
};
