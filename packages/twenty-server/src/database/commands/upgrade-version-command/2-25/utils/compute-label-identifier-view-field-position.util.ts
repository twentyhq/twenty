// The label identifier's view field has to sit strictly below every other view
// field of its view (see validateLabelIdentifierFieldMetadataIdFlatViewField).
// A standard position cannot be trusted on an existing workspace: the columns
// there were created before the standard definition changed, so the field that
// used to be the label identifier still holds the standard's lowest position
// and would tie with the incoming one.
export const computeLabelIdentifierViewFieldPosition = ({
  otherViewFieldPositions,
  standardPosition,
}: {
  otherViewFieldPositions: number[];
  standardPosition: number;
}): number => {
  if (otherViewFieldPositions.length === 0) {
    return standardPosition;
  }

  return Math.min(...otherViewFieldPositions, standardPosition) - 1;
};
