import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const NO_RESTRICTED_FIELD_NAMES: string[] = [];

export const getRestrictedFieldNamesFromRecord = ({
  record,
}: {
  record: ObjectRecord | null | undefined;
}): string[] => {
  if (!isDefined(record)) {
    return NO_RESTRICTED_FIELD_NAMES;
  }

  const restrictedFieldNames = Object.keys(record).filter((fieldName) =>
    isFieldValueRestricted(record[fieldName]),
  );

  return restrictedFieldNames.length === 0
    ? NO_RESTRICTED_FIELD_NAMES
    : restrictedFieldNames;
};
