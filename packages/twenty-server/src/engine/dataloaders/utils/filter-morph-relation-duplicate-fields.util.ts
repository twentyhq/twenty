import { transpileToDateIfNot } from 'src/utils/transpile-to-date-if-not.util';

export const filterMorphRelationDuplicateFields = <
  T extends { createdAt: Date; morphId: string | null },
>(
  fields: T[],
) => {
  return fields.filter((currentField) => {
    return !fields.some(
      (otherField) =>
        otherField.morphId === currentField.morphId &&
        transpileToDateIfNot(otherField.createdAt).getTime() >
          transpileToDateIfNot(currentField.createdAt).getTime(),
    );
  });
};
