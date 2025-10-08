import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const isViewFieldInLowestPosition = ({
  flatViewField,
  otherFlatViewFields,
}: {
  otherFlatViewFields: FlatViewField[];
  flatViewField: FlatViewField;
}) => {
  if (otherFlatViewFields.length === 0) {
    return true;
  }
  const ascSortedViewFieldPositions = otherFlatViewFields
    .map(({ position }) => position)
    .sort();
  const lowestPosition = ascSortedViewFieldPositions[0];
  return flatViewField.position < lowestPosition;
};
