const UPDATED_AT_FIELD_NAME = 'updatedAt';

// For related records only: events omit updatedAt, and on the record itself the recompute's write would loop
export const isWatchedFieldUpdated = ({
  updatedFields,
  watchedFieldNames,
}: {
  updatedFields?: string[];
  watchedFieldNames: ReadonlySet<string>;
}): boolean =>
  watchedFieldNames.has(UPDATED_AT_FIELD_NAME) ||
  (updatedFields ?? []).some((fieldName) => watchedFieldNames.has(fieldName));
