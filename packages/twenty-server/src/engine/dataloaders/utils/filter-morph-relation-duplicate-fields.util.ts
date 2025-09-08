export const filterMorphRelationDuplicateFieldsDTO = <
  T extends { createdAt: Date; morphId: string | null },
>(
  fields: T[],
) => {
  return fields.filter((currentField) => {
    return !fields.some(
      (otherField) =>
        otherField.morphId === currentField.morphId &&
        otherField.createdAt.getTime() > currentField.createdAt.getTime(),
    );
  });
};
