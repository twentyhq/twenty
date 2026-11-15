import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined, isEmptyObject, isPlainObject } from 'twenty-shared/utils';

const isRecordGqlConnection = (value: unknown): value is RecordGqlConnection =>
  isPlainObject(value) && isDefined(value.edges);

// Flattening a connection into an array drops its own fields, so its aggregates are kept beside it
const getRelationAggregateValues = (recordNode: RecordGqlNode) =>
  Object.fromEntries(
    Object.entries(recordNode).flatMap(([fieldName, value]) => {
      if (!isRecordGqlConnection(value)) {
        return [];
      }

      const {
        edges: _edges,
        pageInfo: _pageInfo,
        __typename: _typename,
        ...aggregateValues
      } = value;

      return isEmptyObject(aggregateValues)
        ? []
        : [[fieldName, aggregateValues]];
    }),
  );

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: RecordGqlNode;
}): T => {
  const { id, __typename } = recordNode;

  const relationAggregateValues = getRelationAggregateValues(recordNode);

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

        return isDefined(value.edges)
          ? [
              fieldName,
              getRecordsFromRecordConnection({ recordConnection: value }),
            ]
          : [fieldName, getRecordFromRecordNode<T>({ recordNode: value })];
      }),
    ),
    ...(isEmptyObject(relationAggregateValues)
      ? {}
      : { [RELATION_AGGREGATE_VALUES_RECORD_KEY]: relationAggregateValues }),
    // Only adds `id` and `__typename` if they exist.
    // RawJson field value passes through this method and does not have `id` or `__typename`.
    // This prevents adding an undefined `id` and `__typename` to the RawJson field value,
    // which is invalid JSON.
    ...(isDefined(id) ? { id } : {}),
    ...(isDefined(__typename) ? { __typename } : {}),
  } as T;
};
