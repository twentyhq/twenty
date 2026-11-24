const UPDATED_AT_FIELD_NAME = 'updatedAt';

// Every update moves updatedAt, which record events leave out of their updated fields.
// Only for related records: on the record itself, the recompute's own write would mark it again
export const isWatchedFieldUpdated = ({
  updatedFields,
  watchedFieldNames,
}: {
  updatedFields?: string[];
  watchedFieldNames: ReadonlySet<string>;
}): boolean =>
  watchedFieldNames.has(UPDATED_AT_FIELD_NAME) ||
  (updatedFields ?? []).some((fieldName) => watchedFieldNames.has(fieldName));
