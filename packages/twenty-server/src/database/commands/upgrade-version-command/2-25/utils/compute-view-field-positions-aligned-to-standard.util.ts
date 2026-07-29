type ViewFieldPosition = {
  universalIdentifier: string;
  position: number;
};

// The label identifier's column has to sit strictly below every other column of
// its view. Slotting the incoming column below the current lowest position
// satisfies that once, but does not survive: viewField.position is compared by
// the standard-application sync, so a position that differs from the standard
// one is pulled back and fails the same validation again.
//
// Aligning the view to the standard layout instead leaves the sync with nothing
// to do. Columns the standard application does not know about keep their
// relative order and move above the standard ones, so they cannot tie with the
// label identifier either.
export const computeViewFieldPositionsAlignedToStandard = ({
  existingViewFields,
  standardPositionByUniversalIdentifier,
}: {
  existingViewFields: ViewFieldPosition[];
  standardPositionByUniversalIdentifier: Record<string, number>;
}): ViewFieldPosition[] => {
  const standardPositions = Object.values(
    standardPositionByUniversalIdentifier,
  );

  if (standardPositions.length === 0) {
    return [];
  }

  const highestStandardPosition = Math.max(...standardPositions);

  const customViewFields = existingViewFields
    .filter(
      ({ universalIdentifier }) =>
        standardPositionByUniversalIdentifier[universalIdentifier] === undefined,
    )
    .sort((a, b) => a.position - b.position);

  return existingViewFields.flatMap((existingViewField) => {
    const { universalIdentifier, position } = existingViewField;
    const standardPosition =
      standardPositionByUniversalIdentifier[universalIdentifier];

    if (standardPosition !== undefined) {
      return standardPosition === position
        ? []
        : [{ universalIdentifier, position: standardPosition }];
    }

    const customIndex = customViewFields.findIndex(
      (customViewField) =>
        customViewField.universalIdentifier === universalIdentifier,
    );
    const targetPosition = highestStandardPosition + 1 + customIndex;

    return targetPosition === position
      ? []
      : [{ universalIdentifier, position: targetPosition }];
  });
};
