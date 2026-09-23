import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const getGroupByDimensionLabel = (
  entry: ObjectRecordGroupBy[number],
): string => {
  const [firstFieldEntry] = Object.entries(entry);

  if (!isDefined(firstFieldEntry)) {
    return '';
  }

  const [fieldName, fieldDefinition] = firstFieldEntry;

  if (fieldDefinition === true) {
    return fieldName;
  }

  if (!isPlainObject(fieldDefinition)) {
    return fieldName;
  }

  const [firstNestedEntry, ...otherNestedEntries] =
    Object.entries(fieldDefinition);

  if (!isDefined(firstNestedEntry) || otherNestedEntries.length > 0) {
    return fieldName;
  }

  const [nestedFieldName, nestedFieldDefinition] = firstNestedEntry;

  if (nestedFieldDefinition !== true) {
    return fieldName;
  }

  if (nestedFieldName === 'unnest') {
    return fieldName;
  }

  if (nestedFieldName === 'id' && fieldName.endsWith('Id')) {
    return fieldName;
  }

  return `${fieldName}.${nestedFieldName}`;
};
