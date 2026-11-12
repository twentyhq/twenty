import { FieldMetadataType } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

export const hasMergeableFieldValue = (
  fieldType: FieldMetadataType | undefined,
  value: unknown,
): boolean => {
  // A currency code without an amount is not a value worth keeping
  if (fieldType === FieldMetadataType.CURRENCY && isPlainObject(value)) {
    return hasRecordFieldValue(value.amountMicros);
  }

  return hasRecordFieldValue(value);
};
