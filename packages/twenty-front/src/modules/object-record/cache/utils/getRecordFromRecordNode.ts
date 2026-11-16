import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type RelationAggregateValues } from '@/object-record/record-column-aggregate/types/RelationAggregateValues';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: RecordGqlNode;
}): T => {
  const { id, __typename } = recordNode;

  let relationAggregateValues: RelationAggregateValues | undefined;

  return {
    ...Object.fromEntries(
      Object.entries(recordNode).map(([fieldName, value]) => {
        if (
          !isDefined(value) ||
          Array.isArray(value) ||
          typeof value !== 'object'
        ) {
          return [fieldName, value];
        }

        if (!isDefined(value.edges)) {
          return [fieldName, getRecordFromRecordNode<T>({ recordNode: value })];
        }

        // Flattening a connection into an array drops its own fields, so its aggregates are kept beside it
        const {
          edges: _edges,
          pageInfo: _pageInfo,
          __typename: _typename,
          ...aggregateValues
        } = value;

        if (!isEmptyObject(aggregateValues)) {
          relationAggregateValues ??= {};
          relationAggregateValues[fieldName] = aggregateValues;
        }

        return [
          fieldName,
          getRecordsFromRecordConnection({ recordConnection: value }),
        ];
      }),
    ),
    ...(isDefined(relationAggregateValues)
      ? { [RELATION_AGGREGATE_VALUES_RECORD_KEY]: relationAggregateValues }
      : {}),
    // Only adds `id` and `__typename` if they exist.
    // RawJson field value passes through this method and does not have `id` or `__typename`.
    // This prevents adding an undefined `id` and `__typename` to the RawJson field value,
    // which is invalid JSON.
    ...(isDefined(id) ? { id } : {}),
    ...(isDefined(__typename) ? { __typename } : {}),
  } as T;
};
