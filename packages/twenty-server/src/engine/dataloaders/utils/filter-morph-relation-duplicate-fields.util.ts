const transpileAsDateIfNot = (dateToVerify: string | Date): Date =>
  dateToVerify instanceof Date ? dateToVerify : new Date(dateToVerify);

export const filterMorphRelationDuplicateFields = <
  T extends { createdAt: Date; morphId: string | null },
>(
  fields: T[],
) => {
  return fields.filter((currentField) => {
    return !fields.some((otherField) => {
      console.log(otherField.createdAt);
      return (
        otherField.morphId === currentField.morphId &&
        transpileAsDateIfNot(otherField.createdAt).getTime() >
          transpileAsDateIfNot(currentField.createdAt).getTime()
      );
    });
  });
};
