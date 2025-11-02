import { normalizeGroupByDimensionValue } from '@/apollo/optimistic-effect/group-by/utils/normalizeGroupByDimensionValue';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isDefined } from 'twenty-shared/utils';

export const doesRecordBelongToGroup = (
  record: RecordGqlNode,
  groupByDimensionValues: readonly string[],
  groupByConfig?: Array<Record<string, boolean | Record<string, string>>>,
): boolean => {
  if (!isDefined(groupByConfig) || groupByConfig.length === 0) {
    return true;
  }

  const groupByFieldNames = groupByConfig.map(
    (groupByField) => Object.keys(groupByField)[0],
  );

  for (let i = 0; i < groupByFieldNames.length; i++) {
    const fieldName = groupByFieldNames[i];
    const expectedValue = groupByDimensionValues[i];

    if (!isDefined(expectedValue)) {
      continue;
    }

    let recordValue = record[fieldName];

    if (!isDefined(recordValue)) {
      return false;
    }

    const fieldConfig = groupByConfig[i][fieldName];
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
};
