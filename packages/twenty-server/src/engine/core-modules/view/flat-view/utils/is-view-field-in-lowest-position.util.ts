import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

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
  const positions = otherFlatViewFields.map(({ position }) => position);
  const lowestPosition = Math.min(...positions);

  return flatViewField.position < lowestPosition;
};
