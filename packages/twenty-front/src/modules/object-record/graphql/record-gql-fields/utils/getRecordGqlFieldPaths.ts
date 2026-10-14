import { type RecordGqlFields } from 'twenty-shared/types';

// Flattens a selection into dotted paths so that nested additions such as
// `company.employees` are visible to callers that compare selections by name.
export const getRecordGqlFieldPaths = (
  recordGqlFields: RecordGqlFields,
  pathPrefix = '',
): string[] =>
  Object.entries(recordGqlFields).flatMap(([fieldName, selection]) =>
    selection === true
      ? [`${pathPrefix}${fieldName}`]
      : getRecordGqlFieldPaths(selection, `${pathPrefix}${fieldName}.`),
  );
