export const filterMorphRelationDuplicateFieldsDTO = <
  T extends { name: string; id: string },
>(
  fields: T[],
) => {
  return fields.filter((currentField) => {
    return !fields.some(
      (otherField) =>
        otherField.name === currentField.name &&
        otherField.id > currentField.id,
    );
  });
};
