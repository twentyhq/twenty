import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Equal, In, type FindOperator } from 'typeorm';

import {
  type ConflictingFieldGroup,
  type ConflictingFieldValue,
  type ConflictingProperty,
} from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';

type WhereCondition = Record<string, FindOperator<ConflictingFieldValue>>;

const buildCompositeConditionKey = (
  conditionEntries: [string, ConflictingFieldValue][],
): string => {
  const sortedEntries = [...conditionEntries].sort(([columnA], [columnB]) =>
    columnA.localeCompare(columnB),
  );

  return JSON.stringify(sortedEntries);
};

const buildSingleColumnCondition = (
  records: Partial<ObjectRecord>[],
  conflictingProperty: ConflictingProperty,
): WhereCondition | undefined => {
  const distinctValues = [
    ...new Set(
      records
        .map((record) => getValueFromPath(record, conflictingProperty.fullPath))
        .filter(isDefined),
    ),
  ];

  if (distinctValues.length === 0) {
    return undefined;
  }

  return { [conflictingProperty.column]: In(distinctValues) };
};

const buildCompositeConditionEntries = (
  record: Partial<ObjectRecord>,
  conflictingProperties: ConflictingProperty[],
): [string, ConflictingFieldValue][] | undefined => {
  const conditionEntries: [string, ConflictingFieldValue][] = [];

  for (const conflictingProperty of conflictingProperties) {
    const fieldValue = getValueFromPath(record, conflictingProperty.fullPath);

    if (!isDefined(fieldValue)) {
      return undefined;
    }

    conditionEntries.push([conflictingProperty.column, fieldValue]);
  }

  return conditionEntries;
};

export const buildWhereConditions = (
  records: Partial<ObjectRecord>[],
  conflictingFieldGroups: ConflictingFieldGroup[],
): WhereCondition[] => {
  const whereConditions: WhereCondition[] = [];
  const seenCompositeConditionKeys = new Set<string>();

  for (const conflictingFieldGroup of conflictingFieldGroups) {
    const { conflictingProperties } = conflictingFieldGroup;

    if (conflictingProperties.length === 1) {
      const condition = buildSingleColumnCondition(
        records,
        conflictingProperties[0],
      );

      if (isDefined(condition)) {
        whereConditions.push(condition);
      }

      continue;
    }

    for (const record of records) {
      const conditionEntries = buildCompositeConditionEntries(
        record,
        conflictingProperties,
      );

      if (!isDefined(conditionEntries)) {
        continue;
      }

      const conditionKey = buildCompositeConditionKey(conditionEntries);

      if (seenCompositeConditionKeys.has(conditionKey)) {
        continue;
      }

      seenCompositeConditionKeys.add(conditionKey);

      whereConditions.push(
        conditionEntries.reduce<WhereCondition>(
          (accumulator, [column, value]) => {
            accumulator[column] = Equal(value);

            return accumulator;
          },
          {},
        ),
      );
    }
  }

  return whereConditions;
};
