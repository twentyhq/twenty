import { normalizeGroupByDimensionValue } from '@/apollo/optimistic-effect/group-by/utils/normalizeGroupByDimensionValue';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isDefined } from 'twenty-shared/utils';

export const doesRecordBelongToGroup = (
  record: RecordGqlNode,
  groupByDimensionValues: readonly string[],
  groupByConfig?:
    | Array<Record<string, boolean | Record<string, string>>>
    | Record<string, boolean | Record<string, string>>,
): boolean => {
  if (!isDefined(groupByConfig) || groupByConfig.length === 0) {
    return true;
  }

  if (Array.isArray(groupByConfig)) {
    for (const [i, groupByField] of groupByConfig.entries()) {
      const [fieldName] = Object.keys(groupByField);
      const expectedValue = groupByDimensionValues[i];

      if (!isDefined(expectedValue)) {
        continue;
      }

      if (!isDefined(fieldName)) {
        return false;
      }

      let recordValue = record[fieldName];

      if (!isDefined(recordValue)) {
        return false;
      }

      const fieldConfig = groupByField[fieldName];
      const recordValueStr = normalizeGroupByDimensionValue(
        recordValue,
        fieldConfig,
      );
      const expectedValueStr = normalizeGroupByDimensionValue(
        expectedValue,
        fieldConfig,
      );

      if (recordValueStr !== expectedValueStr) {
        return false;
      }
    }

    return true;
  } else {
    const recordGroupNames = Object.keys(groupByConfig);

    for (const recordGroupName of recordGroupNames) {
      if (groupByConfig[recordGroupName] === true) {
        const recordGroupValue = record[recordGroupName];

        if (groupByDimensionValues.includes(recordGroupValue)) {
          return true;
        }
      }
    }

    return false;
  }
};
