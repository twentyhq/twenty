import { isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const getGroupByDimensionLabel = (
  entry: ObjectRecordGroupBy[number],
): string => {
  const fieldEntries = Object.entries(entry);

  if (fieldEntries.length === 0) {
    return '';
  }

  const [fieldName, fieldDefinition] = fieldEntries[0];

  if (fieldDefinition === true) {
    return fieldName;
  }

  if (!isPlainObject(fieldDefinition)) {
    return fieldName;
  }

  const nestedEntries = Object.entries(fieldDefinition);

  if (nestedEntries.length !== 1) {
    return fieldName;
  }

  const [nestedFieldName, nestedFieldDefinition] = nestedEntries[0];

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
