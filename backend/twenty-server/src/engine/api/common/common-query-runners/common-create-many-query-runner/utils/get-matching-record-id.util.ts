import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const getMatchingRecordId = (
  record: Partial<ObjectRecord>,
  conflictingFields: {
    baseField: string;
    fullPath: string;
    column: string;
  }[],
  existingRecords: PartialObjectRecordWithId[],
): string | undefined => {
  const matchingRecordIds = conflictingFields.reduce<string[]>((acc, field) => {
    const requestFieldValue = getValueFromPath(record, field.fullPath);

    const matchingRecord = existingRecords.find((existingRecord) => {
      const existingFieldValue = getValueFromPath(
        existingRecord,
        field.fullPath,
      );

      return (
        isDefined(existingFieldValue) &&
        existingFieldValue === requestFieldValue
      );
    });

    if (isDefined(matchingRecord)) {
      acc.push(matchingRecord.id);
    }

    return acc;
  }, []);

  if ([...new Set(matchingRecordIds)].length > 1) {
    const conflictingFieldsValues = conflictingFields
      .map((field) => {
        const value = getValueFromPath(record, field.fullPath);

        return isDefined(value) ? `${field.fullPath}: ${value}` : undefined;
      })
      .filter(isDefined)
      .join(', ');

    throw new CommonQueryRunnerException(
      `Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
      CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
      {
        userFriendlyMessage: msg`Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
      },
    );
  }

  return matchingRecordIds[0];
};
