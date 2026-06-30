import { isDefined } from 'src/utils/is-defined';

export const pickWritableStandard = ({
  standard,
  current,
  emptyChecks,
  overrideExistingValues,
}: {
  standard: Record<string, unknown>;
  current: Record<string, unknown>;
  emptyChecks: Record<string, (current: unknown) => boolean>;
  overrideExistingValues?: boolean;
}): Record<string, unknown> => {
  const writableFields: Record<string, unknown> = {};

  for (const [fieldName, fieldValue] of Object.entries(standard)) {
    const isEmptyCheck = emptyChecks[fieldName];
    if (
      isDefined(isEmptyCheck) &&
      (overrideExistingValues === true || isEmptyCheck(current[fieldName]))
    ) {
      writableFields[fieldName] = fieldValue;
    }
  }

  return writableFields;
};
