import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Deep-merges two selections. A sub-selection wins over `true` on the same key so
// that a relation loaded with identifiers keeps them when more fields are added.
export const mergeRecordGqlFields = (
  baseRecordGqlFields: RecordGqlFields,
  additionalRecordGqlFields: RecordGqlFields,
): RecordGqlFields => {
  const mergedRecordGqlFields: RecordGqlFields = { ...baseRecordGqlFields };

  for (const [fieldName, additionalValue] of Object.entries(
    additionalRecordGqlFields,
  )) {
    const baseValue = mergedRecordGqlFields[fieldName];

    if (!isDefined(baseValue) || baseValue === true) {
      mergedRecordGqlFields[fieldName] = additionalValue;
      continue;
    }

    if (additionalValue === true) {
      continue;
    }

    mergedRecordGqlFields[fieldName] = mergeRecordGqlFields(
      baseValue,
      additionalValue,
    );
  }

  return mergedRecordGqlFields;
};
