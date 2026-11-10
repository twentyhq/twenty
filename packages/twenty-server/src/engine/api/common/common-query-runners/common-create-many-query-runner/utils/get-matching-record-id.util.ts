import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { type PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const findMostRecentlyDeletedRecord = (
  records: PartialObjectRecordWithId[],
): PartialObjectRecordWithId | undefined =>
  [...records].sort(
    (recordA, recordB) =>
      new Date(recordB.deletedAt ?? 0).getTime() -
      new Date(recordA.deletedAt ?? 0).getTime(),
  )[0];

export const getMatchingRecordId = (
  record: Partial<ObjectRecord>,
  conflictingFieldGroups: ConflictingFieldGroup[],
  existingRecords: PartialObjectRecordWithId[],
): string | undefined => {
  const matchingRecordIds = new Set<string>();
  const restorableRecordIds = new Set<string>();

  for (const fieldGroup of conflictingFieldGroups) {
    const requestFieldValues = fieldGroup.conflictingProperties.map(
      (conflictingProperty) => ({
        conflictingProperty,
        value: getValueFromPath(record, conflictingProperty.fullPath),
      }),
    );

    if (requestFieldValues.some(({ value }) => !isDefined(value))) {
      continue;
    }

    const matchingRecords = existingRecords.filter((existingRecord) =>
      requestFieldValues.every(({ conflictingProperty, value }) => {
        const existingFieldValue = getValueFromPath(
          existingRecord,
          conflictingProperty.fullPath,
        );

        return isDefined(existingFieldValue) && existingFieldValue === value;
      }),
    );

    const matchingRecord = fieldGroup.isIgnoringDeletedRecords
      ? matchingRecords.find(
          (existingRecord) => !isDefined(existingRecord.deletedAt),
        )
      : matchingRecords[0];

    if (isDefined(matchingRecord)) {
      matchingRecordIds.add(matchingRecord.id);
      continue;
    }

    const restorableRecord = findMostRecentlyDeletedRecord(matchingRecords);

    if (isDefined(restorableRecord)) {
      restorableRecordIds.add(restorableRecord.id);
    }
  }

  const candidateRecordIds =
    matchingRecordIds.size > 0 ? matchingRecordIds : restorableRecordIds;

  if (candidateRecordIds.size > 1) {
    const conflictingFieldsValues = conflictingFieldGroups
      .map((group) => {
        const values = group.conflictingProperties
          .map((conflictingProperty) => {
            const value = getValueFromPath(
              record,
              conflictingProperty.fullPath,
            );

            return isDefined(value)
              ? `${conflictingProperty.fullPath}: ${value}`
              : undefined;
          })
          .filter(isDefined);

        if (values.length === 0) {
          return undefined;
        }

        return `${group.baseFields.join(', ')} (${values.join(', ')})`;
      })
      .filter(isDefined)
      .join('; ');

    throw new CommonQueryRunnerException(
      `Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
      CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT,
      {
        userFriendlyMessage: msg`Multiple records found with the same unique field values for ${conflictingFieldsValues}. Cannot determine which record to update.`,
      },
    );
  }

  const [matchingRecordId] = candidateRecordIds;

  return matchingRecordId;
};
