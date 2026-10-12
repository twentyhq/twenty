import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export const pickRestResponseFields = ({
  record,
  selectedFields,
}: {
  record: ObjectRecord;
  selectedFields: CommonSelectedFields;
}): ObjectRecord => {
  const selectedFieldNames = new Set(Object.keys(selectedFields));
  const pickedRecord: ObjectRecord = { id: record.id };

  for (const [fieldName, fieldValue] of Object.entries(record)) {
    if (selectedFieldNames.has(fieldName)) {
      pickedRecord[fieldName] = fieldValue;
    }
  }

  return pickedRecord;
};
